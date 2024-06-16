<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$out = array('data' => []);

$ice_id = @$_REQUEST['ice_id'];
$dt = @$_REQUEST['dt'];

$out['data'] = Nsr::get_statgraph($ice_id, $dt);

echo json_encode($out, JSON_UNESCAPED_UNICODE);



