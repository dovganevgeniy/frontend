'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');
const zip = require('gulp-zip');
const fileinclude = require('gulp-file-include');
const order = require('gulp-order');
const uglifyjs = require('gulp-uglifyjs');
const sourcemaps = require('gulp-sourcemaps');
const assign = require('object-assign');
const browserSync = require('browser-sync');
const modRewrite = require('connect-modrewrite');
const reload = browserSync.reload;
const imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const gulpSSH = require('gulp-ssh');
const expandTilde = require('expand-tilde');
const plato = require('gulp-plato');
const exec = require('child_process').exec;
const newer = require('gulp-newer');

// =============================================
// Если нужно перекрыть объект в конфиге создаем
// файл gulp.conf.json в корне (подробнее в pr/2017/_10005.md)
const confPath = './gulp.conf.json';
const config = assign({
	connect: {
		server: {
			baseDir: [ './development', './production' ]
		},
		tunnel: false,
		host: 'localhost',
		port: 8000,
		logPrefix: 'Frontend_z585',
		middleware: [
			modRewrite([
				'/bitrix/templates/zoloto/frontend/fonts /fonts [L]',
				'/bitrix/templates/zoloto/frontend/images /img [L]',
			])
		]
	},

	ssh: {
		// Перекрывается в confPath
		host: '',
		port: 22,
		username: '',
		password: '',
		privateKey: '',
		passphrase: '',
	},

	deploy: {
		// Перекрывается в confPath
		path: ''
	},

	autoprefixer: {
		dev: {
			browsers: ['last 2 versions'],
		},
		prod: {
			browsers: ['> 2%'],
		},
	},

	path: {
		js: {
			libs: [
				// @todo: gulp-order
				'development/js/libs/plugins/picturefill.min.js',
				//
				'development/js/libs/jqueryteam/jquery-1.11.1.min.js',
				'development/js/libs/jqueryteam/owl.carousel.js',
				'development/js/libs/jqueryteam/select.js',
				'development/js/libs/jqueryteam/jquery-ui.js',
				'development/js/libs/jqueryteam/jquery.ui.touch-punch.min.js',
				'development/js/libs/jqueryteam/jquery.ui.datepicker-ru.js',
				'development/js/libs/jqueryteam/jquery.touchSwipe.min.js',
				'development/js/libs/jqueryteam/jquery.zoom.js',
				'development/js/libs/jqueryteam/fotorama.js',
				'development/js/libs/jqueryteam/jquery.mousewheel.js',
				'development/js/libs/jqueryteam/perfect-scrollbar.js',
				'development/js/libs/jqueryteam/jquery.magnific-popup.js',
				'development/js/libs/jqueryteam/jquery.plugin.js',
				'development/js/libs/jqueryteam/jquery.countdown.js',
				'development/js/libs/jqueryteam/jquery.countdown-ru.js',
				'development/js/libs/jqueryteam/jquery.inputmask.js',
				'development/js/libs/jqueryteam/jquery.validate.min.js',
				'development/js/libs/jqueryteam/jquery.cookie.js',
				'development/js/libs/jqueryteam/jquery.jscrollpane.min.js',
				'development/js/libs/jqueryteam/jquery.formstyler.min.js',
				'development/js/libs/jqueryteam/jquery.session.js',
				'development/js/libs/jqueryteam/jquery.easydropdown.js',
				'development/js/libs/jqueryteam/jquery.maskedinput.min.js',
				'development/js/libs/jqueryteam/selectivizr-min.js',
				'development/js/libs/jqueryteam/TweenMax.min.js',
				//
				'development/js/libs/jsrender/jsrender.js',
				//
				'development/js/libs/**/*.js',
				'!development/js/libs/jqueryteam/jquery-1.11.0.min.js',
			],

			app: [
				// @todo: gulp-order
				'development/js/app/z585.js',
				'development/js/app/z585.main.js',
				'development/js/app/z585.data.js',
				'development/js/app/z585.debug.js',
				'development/js/app/z585.htmlrender.js',
				'development/js/app/z585.yamaps.js',
				'development/js/app/z585.modal.js',
				'development/js/app/**/*.js',
			],

			pages: [
				'development/js/pages/**/*.js',
			],

			views: [
				'development/js/views/*.js'
			],
			
			report: [
				'development/js/app/**/*.js',
				'development/js/legacy/**/*.js',
			],
		},

		less: [
			'development/less/scaffolding/z585-all.less',
		],

		html: [
			'development/htmls/*.tmpl',
			'!development/htmls/your-page.tmpl'
		],

		images: [
			'development/img/**/*.*',
		],

		adfox: {
			less: [
				'development/less/mixins/@path-global.less',
				'development/less/scaffolding/mixins.less',
				'development/less/scaffolding/layout__fonts.less',
				'development/less/scaffolding/layout__adfox.less',
			],
			js: [
				'development/js/jqueryteam/jquery-1.11.1.min.js',
				'development/js/jqueryteam/TweenMax.min.js',
				'development/js/countdown.js'
			]
		}
	},
}, fs.existsSync(confPath) ? require(confPath) : {});

// подключение по ssh
if (config.ssh.privateKey.length) {
	config.ssh.privateKey = fs.readFileSync(config.ssh.privateKey);
}

const ssh = new gulpSSH({
	ignoreErrors: false,
	sshConfig: config.ssh
});

// Общие ф-ции
const helper = {

	/**
	 * Возвращает переданный флаг
	 * gulp taskname --arg1 HELLO --arg2 BYE
	 */
	getArg: function(key) {
		let index = process.argv.indexOf('--' + key);
		let next = process.argv[index + 1];
		return (index < 0) ? null : (!next || next[0] === '-') ? true : next;
	},

	/**
	 * Возвращает список директорий
	 */
	getFolders: function(dir) {
		return fs.readdirSync(dir)
			.filter(function(file) {
				return fs.statSync(path.join(dir, file)).isDirectory();
			});
	},

};

// Запуск локального сервера для лайврелоада
gulp.task('webserver', function () {
	browserSync(config.connect);
});

// =================== JavaScript ===================

// Вендоры
gulp.task('js:libs', function () {
	return gulp.src(config.path.js.libs)
		.pipe(concat('libs.min.js'))
		.pipe(uglifyjs())
		.pipe(gulp.dest('production/js/'))
		.pipe(reload({stream: true}));
});

// Основные скрипты
gulp.task('js:app', function () {
	return gulp.src(config.path.js.app)
		.pipe(uglifyjs('app.min.js', {
			outSourceMap: true
		}))
		.pipe(gulp.dest('production/js/'))
		.pipe(reload({stream: true}));
});

// Скрипты для отдельных страниц
gulp.task('js:pages', function () {
	var pagesPath = 'development/js/pages/';
	var folders = helper.getFolders(pagesPath);

	var tasks = folders.map(function(folder) {
		return gulp.src(path.join(pagesPath, folder, '/*.js'))
			.pipe(uglifyjs(folder + '.min.js', {
				outSourceMap: true
			}))
			.pipe(gulp.dest('production/js'))
			.pipe(reload({stream: true}));
	});

	return tasks;
});

// JS Views
gulp.task('js:views', function () {
	return gulp.src(config.path.js.views)
		.pipe(gulp.dest('production/js/views/'))
		.pipe(reload({stream: true}));
});

// JS Adfox
gulp.task('js:adfox', function () {
	return gulp.src(config.path.adfox.js)
		.pipe(uglifyjs('adfox.min.js', {
			outSourceMap: true
		}))
		.pipe(gulp.dest('production/js/'));
});

// Устаревшие скрипты
gulp.task('js:legacy', function() {
	return gulp.src('development/js/legacy/*.js')
		.pipe(order([
			'new.js',
			'main.js',
			'**/*.js',
		]))
		.pipe(uglifyjs('legacy.min.js', {
			outSourceMap: true
		}))
		.pipe(gulp.dest('production/js'))
		.pipe(reload({stream: true}));
});

// Аналитика кода. Складывается в папку report
gulp.task('js:report', function () {
	return gulp.src(config.path.js.report)
		.pipe(plato('report', {
			jshint: {
				options: {
					strict: true
				}
			},
			complexity: {
				trycatch: true
			}
		}));
});

// Сборка скриптов
gulp.task('js:build', [
	'js:libs',
	'js:app',
	'js:pages',
	'js:views',
	'js:adfox',
	'js:legacy',
]);

// =================== HTML ===================

// Шаблоны
gulp.task('html:build', function () {
	return gulp.src(config.path.html)
		.pipe(fileinclude({
			prefix: '@@'
		}))
		.pipe(rename({
			extname: '.html'
		}))
		.pipe(gulp.dest('development'))
		.pipe(browserSync.stream({once: true}));
});

// =================== LESS/CSS ===================

// CSS сборка без минификации
gulp.task('css:build--dev', function () {
	return gulp.src(config.path.less)
		.pipe(concat('z585_all.css'))
		.pipe(less())
		.pipe(autoprefixer(config.autoprefixer.dev))
		.pipe(gulp.dest('production/css'))
		.pipe(reload({stream: true}));
});

// CSS сборка для прода
gulp.task('css:build--prod', function () {
	return gulp.src(config.path.less)
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(concat('z585_all.min.css'))
		.pipe(less())
		.pipe(autoprefixer(config.autoprefixer.prod))
        .pipe(sourcemaps.write('./'))
		.pipe(cssmin())
		.pipe(gulp.dest('production/css'))		
		.pipe(reload({stream: true}));
});

// CSS Adfox
gulp.task('css:adfox', function () {
	return gulp.src(config.path.adfox.less)
		.pipe(concat('z585_adfox.min.css'))
		.pipe(less())
		.pipe(autoprefixer(config.autoprefixer.prod))
		.pipe(cssmin())
		.pipe(gulp.dest('production/css'))
		.pipe(reload({stream: true}));
});

// =============== IMAGE MIN ==================
// Оптимизация картинок
gulp.task('img:build', function() {
	let dest = 'production/images/';
	return gulp.src(config.path.images)
		.pipe(newer(dest))
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 7,
			svgoPlugins: [{removeViewBox: true}]
		}))
		.pipe(gulp.dest(dest));
});

gulp.task('img:build-all', function() {
	let dest = 'production/images/';
	return gulp.src(config.path.images)
		.pipe(imagemin({
			interlaced: true,
			progressive: true,
			optimizationLevel: 7,
			svgoPlugins: [{removeViewBox: true}]
		}))
		.pipe(gulp.dest(dest));
});


// =================== BUILD ===================
// Сборка проекта
gulp.task('build', [
	'js:build',
	'css:build--dev',
	'css:build--prod',
	'css:adfox',
	'html:build',
	'img:build',
]);

// =================== WATCH ===================
// Слежение за изменениями в файлах
gulp.task('watch', [ 'build' ], function() {

	// HTML
	gulp.watch( ['development/htmls/**/*.{tmpl,html}'], ['html:build'] );

	// Less
    //gulp.watch('development/less/**/*.less', [ 'css:build', 'css:adfox' ]);
    gulp.watch('development/less/**/*.less', [ 'css:build--dev' ]);

	// JS
	gulp.watch('development/js/legacy/*.js', [ 'js:legacy' ] );
	gulp.watch('development/js/libs/**/*.js', [ 'js:libs' ] );
	gulp.watch('development/js/app/*.js', [ 'js:app' ] );
	gulp.watch('development/js/pages/**/*.js', [ 'js:pages' ] );
	gulp.watch('development/js/views/*.js', [ 'js:views' ] );

});

// =================== DEPLOY ===================
// Выгрузка на сервер
gulp.task('deploy', [
	'html:build', 
	'deploy--css',
	'deploy--js',
	'deploy--img',
]);

gulp.task('deploy--css', [ 'css:build--dev', 'css:build--prod' ], function() {
	return gulp.src('production/css/**/')
		.pipe(ssh.dest(config.deploy.path + '/css'));
});

gulp.task('deploy--js', [ 'js:build' ],  function() {
	return gulp.src([ 'production/js/**/', '!production/js/libs.min.js' ])
		.pipe(ssh.dest(config.deploy.path + '/js'));
});

gulp.task('deploy--img', [ 'img:build' ], function() {
	return gulp.src('production/images/**/')
		.pipe(ssh.dest(config.deploy.path + '/images'));
});

// =================== GIT ===================

// Создание новой ветки
// @TODO: чекаут на мастера, пулл, чекаут на новую ветку
gulp.task('git-start-test', function() {
	const cmdList = [
		'cd '+ config.deploy.path,
		'git status -uno'
	];

	return ssh
		.shell(cmdList, { filePath: 'git-start.log' })
		.pipe(gulp.dest('logs'))
});

gulp.task('git-start', function () {
	var gitUpdate = [
		'git checkout master',
		'git pull upstream master',
		'git checkout -b test-171217',
		'npm i',
	];

	exec('git ls-files -m', function(code, stdout, stderr) {
		console.log(stdout.length);

		if (stdout.length) {
			console.log('Невозможно продолжить, найдены измененные файлы:');
			console.log(stdout);
		} else {
			exec(gitUpdate.join(' && '), function(code, stdout, stderr) {
				console.log(stdout);
			});	
		}
	});	
});

// =================== START ===================
// Запуск локального сервера и слежение
gulp.task('default', [ 'watch', 'webserver' ]);
