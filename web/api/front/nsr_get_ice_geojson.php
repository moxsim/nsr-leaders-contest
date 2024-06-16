<?php

require_once('../init.php');

header("Content-type: application/json; charset=utf-8");

$ice_id = @$_REQUEST['ice_id'];
$dt = @$_REQUEST['dt'];

echo Nsr::get_ice_geojson($ice_id, $dt);
