<?php

function isGUID($guid){
	if (!@$guid) return false;
	$pattern = '/^[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$/'; 
	return !!preg_match($pattern,strtolower($guid));  
}

// create GUID
function createGUID()
{
	if (function_exists('com_create_guid'))
	{
		return com_create_guid();
	} else {
		mt_srand((double)microtime()*10000);
		//optional for php 4.2.0 and up.
		$set_charid = strtoupper(md5(uniqid(rand(), true)));
    $set_hyphen = chr(45);
		// "-"
		$set_uuid = chr(123)
		.substr($set_charid, 0, 8).$set_hyphen
		.substr($set_charid, 8, 4).$set_hyphen
		.substr($set_charid,12, 4).$set_hyphen
		.substr($set_charid,16, 4).$set_hyphen
		.substr($set_charid,20,12)
		.chr(125);
		// "}"
		return $set_uuid;
	}
}

function chkFolders($root,$folders) {
  $folders = str_replace('\\','/',$folders);
  $arr = explode('/', $folders);
  foreach ($arr as $key => $val) {
    if (!@$val) continue;
    $root = $root.'/'.$val;
    if (!is_dir($root)) mkdir($root);
  }
}

function escape_string($text){
  return str_replace("'","''",$text);
}