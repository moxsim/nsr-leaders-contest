<?php

function _db_query_callback($match, $init = FALSE) {
  static $args = NULL;

  if ($init) {
    $args = $match;
    return;
  }

  switch ($match[1]) {
    case '%d': // We must use type casting to int to convert FALSE/NULL/(TRUE?)
      $value = array_shift($args);
      if (is_null($value)) return 'NULL';
      // Do we need special bigint handling?
      if ($value > PHP_INT_MAX) {
        $precision = ini_get('precision');
        @ini_set('precision', 16);
        $value = sprintf('%.0f', $value);
        @ini_set('precision', $precision);
      }
      else {
        $value = (int) $value;
      }
      // We don't need db_escape_string as numbers are db-safe.
      return $value;
    case '%s':
      return real_escape_string(array_shift($args));
    case '%sn':
      $value = array_shift($args);
      if (is_null($value)) return 'NULL';
      
      return "'" . real_escape_string($value) . "'";
    case '%n':
      // Numeric values have arbitrary precision, so can't be treated as float.
      // is_numeric() allows hex values (0xFF), but they are not valid.
      $value = trim(array_shift($args));
      return is_numeric($value) && !preg_match('/x/i', $value) ? $value : '0';
    case '%%':
      return '%';
    case '%f':
      $value = array_shift($args);
      if (is_null($value)) return 'NULL';
      return (float) $value;
    case '%b': // binary data
      return db_encode_blob(array_shift($args));
  }
}

/**
 * Аналог real_escape_string
 */
function real_escape_string($s) {
  if(get_magic_quotes_gpc()) $s = stripslashes($s);
  $s = str_replace("'","''",$s);
  return $s;
}

function getSn ( $str ) {
  if (is_null($str)) return 'NULL';
  return "'" . real_escape_string($str) . "'";
};

/**
 * Сам класс
 */
class mysqlClass {

  protected $connection = null;
  protected $params;
  
  function __construct($host, $username, $passwd, $dbname, $charset) {
    $this->params = array(
      'host' => $host,
      'username' => $username,
      'passwd' => $passwd,
      'dbname' => $dbname,
      'charset' => $charset
    );
  }
  
  protected function connect() {
    // Повторно не будем открывать соединение            
    if ( $this->connection ) return;

    $this->connection = mysqli_init();
    $this->connection->options(MYSQLI_OPT_CONNECT_TIMEOUT, 60);
    $this->connection->options(MYSQLI_OPT_READ_TIMEOUT, 60);
    $this->connection->real_connect(@$this->params['host'], @$this->params['username'], @$this->params['passwd'], @$this->params['dbname']);

    if ($this->connection->connect_error) {
        $se = sprintf('Ошибка подключения %s: %s',$this->connection->connect_errno, $this->connection->connect_error);
        throw new Exception("База данных недоступна: " . $se);
    }
    mysqli_set_charset($this->connection, @$this->params['charset']);

    // На всякий случай удалим параметры сервера
    // Вдруг, кто-то будет пытаться вытащить эти данные из дампа класса
    //unset($this->params);
  }
  protected function close() {
    mysqli_close($this->connection);
    $this->connection = null;
  }

  /**
   * @param $query Запрос в стиле sprintf
   * @param [ $values... ] Значения
   */
  public function query($query, $is_reconnect = false) {
    if ($is_reconnect) $this->close();
    if (!$this->connection) $this->connect();
    
    $args = func_get_args();
    array_shift($args);
    
    _db_query_callback($args, TRUE);
    $query = preg_replace_callback('/(%d|%sn|%s|%%|%f|%b|%n)/', '_db_query_callback', $query);
    
    $result = mysqli_query($this->connection, $query);
    
    if (!$result) {
        error_log($query);
        $message = mysqli_error($this->connection);
        throw new Exception("<b>Ошибка MySQL: </b><br><br>" . $message . "");      
    }
    
    return $result;
  }
  
  /**
   * Получить очередной массив выборки
   * @param $res указатель на выборку sql
   */
  public function fetch_array($res) {
    $data = mysqli_fetch_array ($res);
    return $data;
  }
  
  /**
   * Получить очередной ассоциированный массив выборки
   * @param $res указатель на выборку sql
   */
  public function fetch_assoc($res) {
    $data = mysqli_fetch_assoc ($res);
    return $data;
  }
  
  /**
   * Получить очередной объект выборки
   * @param $res указатель на выборку sql
   */
  public function fetch_object($res) {
    $data = mysqli_fetch_object($res);
    return $data;
  }
  
}