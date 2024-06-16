<?php

define ('FILE_ROOT', dirname(__FILE__));

/**
 * Подключение библиотек общего назначения
 */
require_once(FILE_ROOT . '/lib/pclzip.lib.php');
require_once(FILE_ROOT . '/lib/xml2array.php');
require_once(FILE_ROOT . '/lib/common.php');

$GUID = trim(createGUID(), '{}'); // Генерируем GUID

/**
 * Подключение настроек
 */
require_once(FILE_ROOT . '/config/config.php');

/**
 * Подключение базы данных
 */
require_once(FILE_ROOT . '/lib/mysql.php');

/**
 * Подключение базы данных
 */
require_once(FILE_ROOT . '/lib/pgsql.php');
$pgsql = new pgsqlClass(
	$config['db_pgsql_server'],
	$config['db_pgsql_port'],
	$config['db_pgsql_username'],
	$config['db_pgsql_password'],
	$config['db_pgsql_database']
);

/**
 * Подключение классов бизнес домена
 */
require_once(FILE_ROOT . '/include/Task.php');
require_once(FILE_ROOT . '/include/Ice.php');
require_once(FILE_ROOT . '/include/Uploader.php');
require_once(FILE_ROOT . '/include/XlsxParse.php');

require_once(FILE_ROOT . '/include/Nsr.php');


