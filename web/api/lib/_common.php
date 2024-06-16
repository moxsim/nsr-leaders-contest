<?php

function isGUID($guid){
	if (!@$guid) return false;
	$pattern = '/^[a-f0-9]{8}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{4}\-[a-f0-9]{12}$/'; 
	return !!preg_match($pattern,strtolower($guid));  
}
function getGUID(){
        mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $hyphen = chr(45);// "-"
        $uuid = '' //chr(123)// "{"
            .substr($charid, 0, 8).$hyphen
            .substr($charid, 8, 4).$hyphen
            .'4'.substr($charid,12, 3).$hyphen
            .substr($charid,16, 4).$hyphen
            .substr($charid,20,12)
            .''; //chr(125);// "}"
        return $uuid;
}
function get_sec() {
	$mtime = microtime();
	$mtime = explode(" ",$mtime);
	$mtime = $mtime[1] + $mtime[0];
	return $mtime;
}
function get_domain_user () {
  $arr = explode('\\\\',$_SERVER['REMOTE_USER']);
  return (@$arr[0] == 'CORP') ? @$arr[1] : '';
}
function object_to_assoc( $object ) {
  return json_decode(json_encode($object),true);
}
function is_date( $str ) { 
  $stamp = strtotime( $str ); 
  if (!is_numeric($stamp)) {
     return FALSE; 
  }
  $month = date( 'm', $stamp ); 
  $day   = date( 'd', $stamp ); 
  $year  = date( 'Y', $stamp ); 
  if (checkdate($month, $day, $year)) { 
     return TRUE;
  }
  return FALSE;
}
function validate_date( $str, $format ) 
{ 
  $stamp = strtotime( $str ); 
  if (!is_numeric($stamp)) {
     return FALSE; 
  }
  $month = date( 'm', $stamp ); 
  $day   = date( 'd', $stamp ); 
  $year  = date( 'Y', $stamp ); 
  
  if (checkdate($month, $day, $year)) {
     return date($format,mktime(0,0,0,$month,$day,$year));
  }
  return FALSE;
}
function generateXmlFromArray($array, $node_name) {
        $xml = '';
        if (is_array($array) || is_object($array)) {
            foreach ($array as $key=>$value) {
                if (is_numeric($key)) {
                    $key = $node_name;
                }

                $xml .= '<' . $key . '>' . generateXmlFromArray($value, $node_name) . '</' . $key . '>';
            }
        } else {
            $xml = htmlspecialchars($array, ENT_QUOTES);
        }
        return $xml;
    }
// Преобразование текста в HTML-текст
function convertToHtml($str) {
  $str = str_replace('"','&quot;',$str);
  $str = str_replace("'",'`',$str);
  $str = str_replace("\r\n",'<br>',$str);
  $str = str_replace("\r",'<br>',$str);
  $str = str_replace("\n",'<br>',$str);
  return $str;
}

function get_headers_curl($url) { 
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL,            $url); 
    curl_setopt($ch, CURLOPT_HEADER,         true); 
    curl_setopt($ch, CURLOPT_NOBODY,         true); 
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_TIMEOUT,        4); 

    $r = curl_exec($ch); 
    //$r = split("\n", $r); 
    return $r; 
}

// Отправка письма
function xmail($sendEmail, $to, $subj, $text, $filenames, $chkSize) {
    global $config;
    
    if (!$sendEmail) return false;
    $from = @$config['smtp_useremail'];
    $fArr = array();
    if (is_array($filenames)) {
            foreach ($filenames as $file => $ff) {
                    if (isset($ff->file)) {
                            if(file_exists($ff->file)) {
                                    $ff->stream = fopen($ff->file,"rb");
                                    $fArr[] = $ff; 
                            }
                    } else {
                            $fArr[] = $ff; 
                    }
            }
    }
    $un        = strtoupper(uniqid(time()));
    $head      = "From: ".@$config['smtp_from']." <$from>\n";
    $head     .= "To: $to\n";
    $head     .= "Subject: $subj\n";
    $head     .= "X-Mailer: PHPMail Tool\n";
    $head     .= "Mime-Version: 1.0\n";
    $head     .= "Content-Type:multipart/mixed;";
    $head     .= "boundary=\"----------".$un."\"\n\n";
    $zag       = "------------".$un."\nContent-Type:text/html;charset=UTF-8;\n";
    $zag      .= "Content-Transfer-Encoding: 8bit\n\n$text\n\n";

    foreach ($fArr as $file => $ff) {
            if (isset($ff->stream) || isset($ff->text)) {
                    $zag      .= "------------".$un."\n";
                    $zag      .= "Content-Type: ".$ff->type.";";
                    $zag      .= "name=\"".basename($ff->name)."\"\n";
                    $zag      .= "Content-Transfer-Encoding:base64\n";
                    $zag      .= "Content-Disposition:attachment;";
                    $zag      .= "filename=\"".basename($ff->name)."\"\n\n";
                    if (isset($ff->text)) 
                            $zag .= chunk_split(base64_encode($ff->text))."\n";
                    else
                            $zag .= chunk_split(base64_encode(fread($ff->stream,filesize($ff->file))))."\n";
            }
    }
    $mailSize = strlen($head)+strlen($zag);
    if ($mailSize > 2000000 && $chkSize) {
        return 'bigsize';
    } else { 
        return smtpmail($to, $zag, $head);
    }
}
// Парсинг HTTP-ответа
function http_response($response) {
  $arr = explode("\r\n\r\n",$response,2);
  $out = new stdClass();
  $out->header = @$arr[0];
  $out->body = @$arr[1];
  return $out;
}
// Отправить ssl запрос не дожидаясь ответа (querystring)
function socket_noresp($params, $host, $script) {
  /*
  $data = http_build_query($params, '', '&'); //$params - массив с данными для б.пхп
  if( $curl = curl_init() ) {
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER,false);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
    curl_setopt($curl, CURLOPT_HEADER, 0);    
    curl_setopt($curl, CURLOPT_TIMEOUT, 3);
    //curl_exec($curl);
    curl_close($curl);
  }
  */
  $fp = @fsockopen("sslv3://".$host, 443, $errno, $errstr, 30);
  //$fp = @fsockopen($host, 80, $errno, $errstr, 30);
  if($fp) 
  {
    $data = http_build_query($params, '', '&'); //$params - массив с данными для б.пхп
    $request = "POST " .$script. " HTTP/1.1\r\n";
    $request .= "Host: " . $host . "\r\n";
    $request .= "Content-Type: application/x-www-form-urlencoded\r\n";
    $request .= "Content-Length: " . strlen($data) . "\r\n";
    $request .= "Connection: Close\r\n\r\n";
    $request .= $data;
    fwrite($fp, $request);
    fclose($fp);
  }
  /*
  $fp = fsockopen("sslv3://".$host, 443, $errno, $errstr, 30);
  $data = http_build_query($params, '', '&'); //$params - массив с данными для б.пхп
  fwrite($fp, "POST " . $script . " HTTP/1.1\r\n");
  fwrite($fp, "Host: ".$host."\r\n");
  fwrite($fp, "Content-Type: application/x-www-form-urlencoded\r\n");
  fwrite($fp, "Content-Length: " . strlen($data) . "\r\n");
  fwrite($fp, "Connection: Close\r\n\r\n");
  fwrite($fp, $data);
  fclose($fp);
  */
}
// Отправить http запрос (POST) не дожидаясь ответа (XML)
function http_xml_noresp($xml, $host, $port, $script, $chk = 1) {
  $result = '';
  if ($chk) {
    $url = 'http://' . $host . ':' . $port ;
    if (!get_headers_curl($url)) return $result;
  }
  $fp = fsockopen($host, $port, $errno, $errstr, 5);
  if (!@$fp) return '';
  fwrite($fp, "POST " . $script . " HTTP/1.1\r\n");
  fwrite($fp, "Host: ".$host."\r\n");
  fwrite($fp, "Content-Type: text/xml; charset=utf-8\r\n");
  fwrite($fp, "Content-Length: " . strlen($xml) . "\r\n");
  fwrite($fp, "Connection: Close\r\n\r\n");
  fwrite($fp, $xml);
  fclose($fp);
  return $result;
}
// Отправить http запрос (POST) и получить ответ (XML)
function http_xml_resp($xml, $host, $port, $script, $chk = 1) {
  $result = '';
  if ($chk) {
    $url = 'http://' . $host . ':' . $port ;
    if (!get_headers_curl($url)) return $result;
  }
  $url .= $script;
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    //curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                                           'Content-type: text/xml', 
                                           'Content-length: ' . strlen($xml)
                                         ));
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

// Отправить http запрос (POST) и получить ответ (XML)
function https_xml_resp($xml, $host, $port, $script, $chk = 1) {
  $result = '';
  if ($chk) {
    $url = 'https://' . $host . ':' . $port ;
    if (!get_headers_curl($url)) return $result;
  }
  $url .= $script;
  
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    //curl_setopt($ch, CURLINFO_HEADER_OUT, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($ch, CURLOPT_POST, 1);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                                           'Content-type: text/xml', 
                                           'Content-length: ' . strlen($xml)
                                         ));
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

// Отправить ssl запрос не дожидаясь ответа (XML)
function socket_xml_noresp($xml, $host, $script) {
  $fp = fsockopen("sslv3://".$host, 443, $errno, $errstr, 30);
  fwrite($fp, "POST " . $script . " HTTP/1.1\r\n");
  fwrite($fp, "Host: ".$host."\r\n");
  fwrite($fp, "Content-Type: text/xml; charset=utf-8\r\n");
  fwrite($fp, "Content-Length: " . strlen($xml) . "\r\n");
  fwrite($fp, "Connection: Close\r\n\r\n");
  fwrite($fp, $xml);
  fclose($fp);
}
// Отправить ssl запрос и получить ответ (querystring)
function socket_resp($params, $host, $script) {
  $result = '';
  $fp = fsockopen("sslv3://".$host, 443, $errno, $errstr, 30);
  $data = http_build_query($params, '', '&'); //$params - массив с данными для б.пхп
  fwrite($fp, "POST " .$script. " HTTP/1.1\r\n");
  fwrite($fp, "Host: ".$host."\r\n");
  fwrite($fp, "Content-Type: application/x-www-form-urlencoded\r\n");
  fwrite($fp, "Content-Length: " . strlen($data) . "\r\n");
  fwrite($fp, "Connection: Close\r\n\r\n");
  fwrite($fp, $data);
    while (!feof($fp)) {
      $result .= @fgets($fp, 1024);
    }
  fclose($fp);
  return $result;
}
// Отправить ssl запрос и получить ответ (XML)
function socket_xml_resp($xml, $host, $script) {
  $result = '';
  $fp = fsockopen("sslv3://".$host, 443, $errno, $errstr, 30);
  fwrite($fp, "POST " . $script . " HTTP/1.1\r\n");
  fwrite($fp, "Host: ".$host."\r\n");
  fwrite($fp, "Content-Type: text/xml; charset=utf-8\r\n");
  fwrite($fp, "Content-Length: " . strlen($xml) . "\r\n");
  fwrite($fp, "Connection: Close\r\n\r\n");
  fwrite($fp, $xml);
    while (!feof($fp)) {
      $result .= @fgets($fp, 4096);
    }
  fclose($fp);
  return $result;
}
// Аутентификация пользователя на главном сервере
function acl_auth ($login,$password) {
    global $config;
    $out = array();
    $params = array(
            'token' => md5(@$config['core_auth_key'].$login.$password.$login.md5($login.$password)),
            'login' => $login,
            'key' => base64_encode($password)
    );
    $host = @$config['core_host'];
    $script = @$config['core_auth_script'];
    $out = http_response(socket_resp($params, $host, $script));
    return $out;
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

/**
 * Функция рекурсивного удаления папки и всего её содержимого
 **/
function removeDirRec($dir) {
    if ($objs = glob($dir."/*")) {
        foreach($objs as $obj) {
            is_dir($obj) ? removeDirRec($obj) : unlink($obj);
        }
    }
    return rmdir($dir);
}

/**
 *  Функция выбирает из текста текстовые картинки и создаёт файлы
 *  затем заменяет ссылки на источники картинок и копрессирует текст в bzip2
 *
 */
function txtCompress($txt, $params) {
    global $user;
    
    $pattern = '/<img[^>]+src=([\'|\"])([^>]+)\1[^>]*>/iU';
    $defaults = 
      array (
        'length' => 0,                        // максимальное количество байт для заархивированного текста, по умолчанию: 0
        'root' => $_SERVER['DOCUMENT_ROOT'],     // корневая папка для сохранения картинок, по умолчанию: $_SERVER['DOCUMENT_ROOT']
        'folder' => 'uploads',                   // папка для сохранения картинок, по умолчанию: 'uploads'
        'serverPath' => '',                      // добавляется к ссылке на источник src, по умолчанию: ''
        'deleteErrorPix' => true                 // Если будет превышено максимальное количество байт удалить созданные картинки, по умолчанию: true
        );
    
    if (@$params['length']) $defaults['length'] = $params['length'];
    if (@$params['root']) $defaults['root'] = $params['root'];
    if (@$params['folder']) $defaults['folder'] = $params['folder'];
    if (@$params['serverPath']) $defaults['serverPath'] = $params['serverPath'];
    if (@$params['deleteErrorPix']) $defaults['deleteErrorPix'] = $params['deleteErrorPix'];
    
    // Выбираем все картинки 
    preg_match_all( $pattern, $txt, $aPics );
    $iNumberOfPics = count($aPics[0]);
    
    $createdFiles = array();
    
    if ( $iNumberOfPics > 0 ) {
         for ( $i=0; $i < $iNumberOfPics ; $i++ ) {
            if (preg_match('/data:image\//',@$aPics[2][$i])) {
                // Если картинки текстовые сохраняем в файл и подменяем src
                $changed = true;
                $pic = explode(';',$aPics[2][$i],2);
                $ext = explode('/',$pic[0],2);
                $picData = explode(',',$pic[1],2);
                unset($pic);
                
                // Сохранение картинки на диске
                $dir = $defaults['root'] . $defaults['folder']; if (!is_dir($dir)) mkdir($dir);
                $dir .= '/pix'; if (!is_dir($dir)) mkdir($dir);
                $dir .= '/'.date("Y-m"); if (!is_dir($dir)) mkdir($dir);
                $dir .= '/'.date("d"); if (!is_dir($dir)) mkdir($dir);
                $file = $dir . '/' . $user->login . '-' . $i . '-' . date("YmdHisu") . '.' . $ext[1];
                file_put_contents($file, base64_decode($picData[1]));
                $createdFiles[] = $file;
                
                // Подмена src в тэге img
                $file_path = str_replace($defaults['root'],'',$file);
                $file_path = ($defaults['serverPath']) ? $defaults['serverPath'] . '/' . $file_path : $file_path;
                $txt = str_replace(@$aPics[2][$i],$file_path,$txt);
            }
        };
    };
    $txt = bzcompress($txt);
    $length = strlen($txt);
    $result = ($defaults['length']==0 || $length <= $defaults['length']);
    
    if (!$result && $defaults['deleteErrorPix']) {
      // Удалить все созданные картинки
      foreach($createdFiles as $key => $val) unlink($val);
    }
    
    return array(
      'result' => $result,
      'length' => $length,
      'bzip2' => $txt,
      'params' => $defaults,
      'newFiles' => $createdFiles
    );
}

  function explodeUserName($name) {
    $result = new stdClass();
    
    $name = preg_replace('/[\s]{2,}/', ' ', $name);
    $tmp = explode(' ',$name);
    
    $result->surname = @$tmp[0];
    if (preg_match("/^\(/",@$tmp[1])) {
      $result->maiden = @$tmp[1];
      $result->name = @$tmp[2];
      $result->father = @$tmp[3];
    } else {
      $result->name = @$tmp[1];
      $result->father = @$tmp[2];
    }
    $result->fi = $result->surname.' '.$result->name;
    $result->if = $result->name.' '.$result->surname;
    return $result;
  }
  
  function link_it($text) {
      $text = str_replace('href=','target="_blank" href=',$text);
      
      // Генерация ссылок
      $text= preg_replace("/(^|[\n ;>])([\w]*?)((ht|f)tp(s)?:\/\/[\w]+[^ \,\"\n\r\t<]+(&nbsp;)*)/is", "$1$2<a href=\"$3\" target=\"_blank\" >$3</a>", $text);
      $text= preg_replace("/(^|[\n ;>])([\w]*? )((www|ftp)\.[^ \,\"\t\n\r<]+(&nbsp;)*)/is", "$1$2<a href=\"http://$3\" \"_blank\">$3</a>", $text);
      $text= preg_replace("/(^|[\n ;>])([a-z0-9&\-_\.]+?)@([\w\-]+\.([\w\-\.]+)+)/i", "$1<a href=\"mailto:$2@$3\">$2@$3</a>", $text);
      
      // Удаление скриптов
      $ptn= "!<script[^>]*>(.)*</script>!Uis"; 
      $text = preg_replace($ptn,"",$text);
      
      return($text);
  }

