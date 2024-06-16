<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$ice_id = @$_REQUEST['ice_id'];
$dt = @$_REQUEST['dt'];

echo json_encode(Nsr::get_ice_graph($ice_id, $dt), JSON_UNESCAPED_UNICODE);
