<?php

namespace ACFTablefield;

use ACFTablefield\FileSystem;

class PluginInfo {

    private static $instance; // Singleton-Instanz
    public static $data = [];

    private function __construct() {

        self::$data['id'] = 'acf_tablefield';
        self::$data['tested_wp_version'] = '6.8';
        self::$data['text_domain'] = 'advanced-custom-fields-table-field';
        self::$data['requires_php_version'] = '7.6';
        self::$data['plugin_dir_name'] = basename( dirname( dirname( __FILE__ ) ) );
        self::$data['state'] = array();
    }

    private static function init() {

        if ( self::$instance === null ) {

            self::$instance = new self();
        }
    }

    public static function set( $key, $value ) {

        self::init();
        self::$data[ $key ] = $value;
    }

    public static function get( $key ) {

        self::init();
        return self::$data[$key] ?? null;
    }
}