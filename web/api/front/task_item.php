<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$out = array('data');

$task_id = @$_REQUEST['task_id'];

$Task = new Task($task_id);

$out['data'] = $Task->getRecord();

echo json_encode($out, JSON_UNESCAPED_UNICODE);
