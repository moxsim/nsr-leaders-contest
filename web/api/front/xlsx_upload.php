<?php

/**
 * Обработчик загрузки файла XLSX
 * Тут делаются проверки на расширение и размер файла
 * Ещё проверяется шапка на соответствие названиям
 * 
 */

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$output = array(
	'success' => true,
	'message' => 'Файл успешно загружен'
);

$task_id = 0;

try {
    // ---------------------------------
    // Обобщённая валидация файла
    // ---------------------------------
    $msg = Uploader::upload_file($task_id);

    if (@$msg) {
        $output = array(
            'success' => false,
            'message' => $msg
        );
        echo(json_encode($output,JSON_UNESCAPED_UNICODE));
        exit();
    }

    // ---------------------------------
    // Получение данных Task из БД
    // ---------------------------------
    $Task = new Task($task_id);

    $output['task_id'] = $Task->getId();
    $output['task_record'] = $Task->getRecord();

    // ------------------------------------------
    // Валидация XLSX на соответствие формату
    // ------------------------------------------
    $xlsx_data = array();
    $msg = Uploader::parse_xlsx_file($task_id, $xlsx_data);

    if (@$msg) {
        $output = array(
            'success' => false,
            'message' => $msg
        );
        echo(json_encode($output,JSON_UNESCAPED_UNICODE));
        exit();
    }

    // ------------------------------------------
    // Заливка основных данных (в один поток)
    // ------------------------------------------
    // TODO: Берём отсюда список файлов $xlsx_data['sheet_part_files'] 
    $xlsx_data['sheet_data'] = array();
    $msg = Uploader::save_xlsx_data($task_id, $xlsx_data);
    if (@$msg) {
        $output = array(
            'success' => false,
            'message' => $msg
        );
        echo(json_encode($output,JSON_UNESCAPED_UNICODE));
        exit();
    }

    $output['xlsx_data'] = $xlsx_data; // Вывод отладочной информации
    echo(json_encode($output,JSON_UNESCAPED_UNICODE));

} catch(Exception $e) {

    $output = array(
        'success' => false,
        'message' => 'Произошёл непредвиденный сбой!<br/><br/>' .$e->getMessage()
    );
    echo(json_encode($output,JSON_UNESCAPED_UNICODE));
    exit();
}
