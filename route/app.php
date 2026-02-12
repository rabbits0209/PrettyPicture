<?php

use think\facade\Route;


Route::get('/', function () {
	include('./error.html');
});
Route::get('index', 'Index/index');
/**
 * 登录注册
 */
Route::group('account', function () {
	Route::post('login', 'Account/login');
	Route::post('sendCode', 'Account/sendCode');
	Route::post('register', 'Account/register');
	Route::post('forget', 'Account/forget');
});

Route::group('user', function () {
	Route::get('info', 'User/info');
	Route::get('home', 'User/home');
	Route::get('storage', 'User/storage');
	Route::get('log', 'User/log');
	Route::put('resetPwd', 'User/resetPwd');
	Route::put('resetKey', 'User/resetKey');
	Route::put('update', 'User/update');
	Route::post('uploadAvatar', 'User/uploadAvatar');
})->middleware(\app\middleware\TokenVerify::class);

Route::group('setup', function () {
	Route::get('index/:type', 'Setup/index')->middleware(\app\middleware\AuthVerify::class);
	Route::put('update', 'Setup/update')->middleware(\app\middleware\AuthVerify::class);
	Route::post('sendTest', 'Setup/sendTest')->middleware(\app\middleware\AuthVerify::class);
})->middleware(\app\middleware\TokenVerify::class);

Route::group('role', function () {
	Route::get('query', 'Role/index');
	Route::post('save', 'Role/save')->middleware(\app\middleware\AuthVerify::class);
	Route::put('update', 'Role/update')->middleware(\app\middleware\AuthVerify::class);
	Route::delete('delete', 'Role/delete')->middleware(\app\middleware\AuthVerify::class);
})->middleware(\app\middleware\TokenVerify::class);

Route::group('storage', function () {
	Route::get('query', 'Storage/index');
	Route::get('type', 'Storage/type');
	Route::put('update', 'Storage/update')->middleware(\app\middleware\AuthVerify::class);
	Route::post('save', 'Storage/save')->middleware(\app\middleware\AuthVerify::class);
	Route::delete('delete', 'Storage/delete')->middleware(\app\middleware\AuthVerify::class);
})->middleware(\app\middleware\TokenVerify::class);

Route::group('images', function () {
	Route::get('query', 'Images/index');
	Route::delete('delete', 'Images/delete');
})->middleware(\app\middleware\TokenVerify::class);

Route::group('member', function () {
	Route::get('query', 'Member/index');
	Route::put('update', 'Member/update')->middleware(\app\middleware\AuthVerify::class);
	Route::post('save', 'Member/save')->middleware(\app\middleware\AuthVerify::class);
	Route::delete('delete', 'Member/delete')->middleware(\app\middleware\AuthVerify::class);
})->middleware(\app\middleware\TokenVerify::class);

Route::group('api', function () {
	Route::post('upload', 'Api/upload');
	Route::delete('delete', 'Api/delete');
	Route::get('random', 'Api/random');
});

Route::group('folder', function () {
	Route::get('query', 'Folder/index');
	Route::post('save', 'Folder/save');
	Route::put('update', 'Folder/update');
	Route::delete('delete', 'Folder/delete');
})->middleware(\app\middleware\TokenVerify::class);