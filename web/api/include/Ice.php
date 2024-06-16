<?php

class Ice {
    public $ice_id;
    public $record;

    function __construct($ice_id = null, $new = []){

        if (@$ice_id) {
            $this->ice_id = $ice_id;
            $this->record = $this->loadRecord($ice_id);
        }
        if (@$new['GUID']){
            $this->ice_id = $this->create($new);
            if (@$this->ice_id) {
                $this->record = $this->loadRecord($ice_id);
            }
        }
    }
    public function getId(){
        return $this->ice_id;
    }
    public function getRecord(){
        return $this->record;
    }
    private function loadRecord($ice_id){
        global $pgsql;

        return $pgsql->fetch_object($pgsql->query(sprintf("
            SELECT 
                ice_id,
                ice_guid,
                load_dtm
            FROM nsr.t_ice
            WHERE 1 = 1
                AND ice_id = %d
        ", $ice_id)));
    }
    private function create($new){
        global $pgsql;

        $pgsql->query(sprintf("
            INSERT INTO 
            nsr.t_ice
            (
                ice_guid
            ) 
            SELECT 
                '%s' AS ice_guid
            WHERE NOT EXISTS (
                SELECT 1
                FROM nsr.t_ice WHERE ice_guid = '%s'
            );"
            , $new['GUID']
            , $new['GUID']
        ));  
  
        $data = $pgsql->fetch_object($pgsql->query(sprintf("
            SELECT ice_id
            FROM nsr.t_ice
            WHERE ice_guid = '%s'
            LIMIT 1;
        ",$new['GUID'])));

        return @$data->ice_id;
    }

    // ----------------------------------
    // Статичные методы
    // ----------------------------------
    static function get_grid($req = []){
        global $pgsql;

        $out = [];
        $res = $pgsql->query(sprintf("
            SELECT 
                ice_id,
                ice_guid,
                load_dtm
            FROM nsr.t_ice
            ORDER BY ice_id DESC
            LIMIT 500;
        "));

        while ($data = $pgsql->fetch_object($res)){
            $out[] = $data;
        }    

        return $out;
    }

}