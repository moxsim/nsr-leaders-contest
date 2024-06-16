<?php

unlink("config.php");

file_put_contents("config.php", file_get_contents("_config_dev.php"));
