<?php

class Task {
    public $task_id;
    public $record;

    function __construct($task_id = null, $new = []){

        if (@$task_id) {
            $this->task_id = $task_id;
            $this->record = $this->loadRecord($task_id);
        }
        if (@$new['GUID']){
            $this->task_id = $this->create($new);
            if (@$this->task_id) {
                $this->record = $this->loadRecord($task_id);
            }
        }
    }
    public function getId(){
        return $this->task_id;
    }
    public function getRecord(){
        return $this->record;
    }
    private function loadRecord($task_id){
        global $pgsql;

        $out = array();

        if (!$task_id) return $out;
        
        $out = $pgsql->fetch_array($pgsql->query(sprintf("
            SELECT 
                tTask.task_id
                ,tTask.ice_id
                ,tTask.task_guid
                ,tTask.filename
                ,tTask.filesize
                ,tTask.load_dtm
            FROM nsr.t_tasks AS tTask
            WHERE 1 = 1
                AND tTask.task_id = %d
        ", $task_id)));

        // ---------------------------------
        $ice_id = $out['ice_id'];
        $out['ices'] = array();

        $res = $pgsql->query(sprintf("
            SELECT dt
            FROM nsr.t_ice_dates AS tDt
            WHERE 1 = 1
                AND tDt.ice_id = %d
            ORDER BY dt
        ", $ice_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['ices'][] = $data->dt;
        }
        // ---------------------------------

        $out['ice_class'] = array();

        $res = $pgsql->query(sprintf("
            SELECT
                 ice_class_id
                ,ice_class_name
            FROM nsr.t_dict_ice_class
        "));

        while ($data = $pgsql->fetch_object($res)){
            $out['ice_class'][$data->ice_class_id] = $data->ice_class_name;
        }
        // ---------------------------------
        $out['points'] = array();
        $res = $pgsql->query(sprintf("
            SELECT 
                 p_id
                ,lon
                ,lat
            FROM nsr.v_ice_coords
            WHERE 1 = 1
                AND ice_id = %d
                AND is_earth = B'0'
            ;
        ", $ice_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['points'][$data->p_id] = array(
                                            'lon'=> $data->lon,
                                            'lat'=> $data->lat
            );
        }


        // ---------------------------------
        $out['nodes'] = array();
        $res = $pgsql->query(sprintf("
            SELECT
                p_id,
                point_name,
                ice_class_id
            FROM nsr.v_ice_statgraph_points
            WHERE 1 = 1
                AND ice_id = %d
            ;
        ", $ice_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['nodes'][$data->p_id] = array(
                                            'p_id'=> $data->p_id,
                                            'point_name'=> $data->point_name,
                                            'ice_class_id'=> $data->ice_class_id,
                                            'is_node'=> true
            );
        }
        // ---------------------------------
        $out['edges'] = array();
        $res = $pgsql->query(sprintf("
            SELECT
                 edge_id
                ,start_p_id
                ,end_p_id
            FROM nsr.v_ice_statgraph_edges
            WHERE 1 = 0
                AND ice_id = %d
            ;
        ", $ice_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['edges'][$data->edge_id] = array(
                                            'edge_id'=> $data->edge_id,
                                            'start_p_id'=> $data->start_p_id,
                                            'end_p_id'=> $data->end_p_id,
                                            'is_node'=> true
            );
        }
        // ---------------------------------
        $out['ships'] = array();
        $res = $pgsql->query(sprintf("
            SELECT 
                ship_id
                , ship_code
                , ship_name
                , arc_class_id
                , arc_class_name
                , ice_class_id
                , escort_ice_class_id
                , speed_knot
                , speed_kmph
                , start_p_id
                , start_coord_id
                , start_point_name
                , start_ice_class_id
                , end_p_id
                , end_coord_id
                , end_point_name
                , end_ice_class_id
                , start_date
            FROM nsr.v_tasks_ships
            WHERE 1 = 1
                AND task_id = %d
            ;
        ", $task_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['ships'][$data->ship_code] = $data;
        }

        $out['icebreakers'] = array();
        $res = $pgsql->query(sprintf("
            SELECT 
                  icebreaker_id
                , ship_code
                , ship_name
                , arc_class_id
                , arc_class_name
                , ice_class_id
                , escort_ice_class_id
                , speed_knot
                , speed_kmph
                , start_p_id
                , start_coord_id
                , start_point_name
                , start_ice_class_id
                , start_date
            FROM nsr.v_tasks_icebreakers
            WHERE 1 = 1
                AND task_id = %d
            ;
        ", $task_id));

        while ($data = $pgsql->fetch_object($res)){
            $out['icebreakers'][$data->ship_code] = $data;
        }

        return $out;
    }
    private function create($new){
        global $pgsql;

        $pgsql->query(sprintf("
            INSERT INTO 
            nsr.t_tasks
            (
                task_guid,
                filename,
                filesize
            ) 
            SELECT 
                '%s' AS task_guid
                ,'%s' AS filename
                ,%d AS filesize
            WHERE NOT EXISTS (
                SELECT 1
                FROM nsr.t_tasks WHERE task_guid = '%s'
            );"
            , $new['GUID']
            , $new['filename']
            , $new['filesize']
            , $new['GUID']
        ));  
  
        $data = $pgsql->fetch_object($pgsql->query(sprintf("
            SELECT task_id
            FROM nsr.t_tasks
            WHERE task_guid = '%s'
            LIMIT 1;
        ",$new['GUID'])));

        return @$data->task_id;
    }

    // ----------------------------------
    // Статичные методы
    // ----------------------------------
    static function get_task_grid($req = []){
        global $pgsql;

        $out = [];
        $res = $pgsql->query(sprintf("
            SELECT 
                task_id,
                task_guid,
                filename,
                filesize,
                load_dtm,
                ice_id
            FROM nsr.t_tasks
            ORDER BY task_id DESC
            LIMIT 500;
        "));

        while ($data = $pgsql->fetch_object($res)){
            $out[] = $data;
        }    

        return $out;
    }

}