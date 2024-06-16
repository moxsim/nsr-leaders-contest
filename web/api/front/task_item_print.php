<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$html = @$_REQUEST['html'];
$filename = FILE_ROOT . '/../downloads/print_' . $GUID . '.html';
$link = 'downloads/print_' . $GUID . '.html';

file_put_contents($filename, $html);

$out['success'] = true;
$out['message'] = 'Файл для печати сформирован';
$out['link'] = $link;

echo json_encode($out, JSON_UNESCAPED_UNICODE);
