<?php

class pgsqlClass {

  protected $connection = null;
  protected $params;
  
  function __construct($host, $port, $username, $passwd, $dbname) {
    $this->params = array(
      'host' => $host,
      'port' => $port,
      'username' => $username,
      'passwd' => $passwd,
      'dbname' => $dbname
    );
  }
  
  protected function connect() {
    if ($this->connection) return;

    $connectionString = sprintf(
      "host=%s port=%d dbname=%s user=%s password=%s",
      $this->params['host'],
      $this->params['port'],
      $this->params['dbname'],
      $this->params['username'],
      $this->params['passwd']
    );

    $this->connection = pg_connect($connectionString);

    if (!$this->connection) {
      throw new Exception("База данных недоступна: " . pg_last_error());
    }
  }
  
  protected function close() {
    if ($this->connection) {
      pg_close($this->connection);
      $this->connection = null;
    }
  }

  public function query($query, $is_reconnect = false) {
    if ($is_reconnect) $this->close();
    if (!$this->connection) $this->connect();
    
    $args = func_get_args();
    array_shift($args);
    
    _db_query_callback($args, TRUE);
    $query = preg_replace_callback('/(%d|%sn|%s|%%|%f|%b|%n)/', '_db_query_callback', $query);
    
    $result = pg_query($this->connection, $query);
    
    if (!$result) {
        error_log($query);
        $message = pg_last_error($this->connection);
        throw new Exception("<b>Ошибка PostgreSQL: </b><br><br>" . $message . "");      
    }
    
    return $result;
  }
  
  public function fetch_array($res) {
    return pg_fetch_array($res);
  }
  
  public function fetch_assoc($res) {
    return pg_fetch_assoc($res);
  }
  
  public function fetch_object($res) {
    return pg_fetch_object($res);
  }
}
?>
