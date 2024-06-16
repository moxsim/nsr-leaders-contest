<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$out = array('data' => []);

$out['data'] = Task::get_task_grid($_REQUEST);

echo json_encode($out, JSON_UNESCAPED_UNICODE);



