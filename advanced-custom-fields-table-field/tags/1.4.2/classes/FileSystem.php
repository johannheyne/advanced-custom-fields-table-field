<?php

namespace ACFTablefield;

use ACFTablefield\PluginInfo;

class FileSystem {

    private static $instance = null; // Singleton-Instanz
    private static $data = [];

    private function __construct() {

        self::$data['plugin_dir_url'] = apply_filters( PluginInfo::get('id') . '/settings/url', dirname( plugin_dir_url( __FILE__) ) . '/' );
        self::$data['plugin_dir_path'] = wp_normalize_path( dirname( self::get_dir_path( __FILE__ ) ) . DIRECTORY_SEPARATOR );
    }

    private static function init() {

        if ( self::$instance === null ) {

            self::$instance = new self();
        }
    }

    public static function get( $key ) {

        self::init();
        return self::$data[$key] ?? null;
    }

    public static function get_dir_path( $file_path = __FILE__ ) {

        $file_path = wp_normalize_path( realpath( $file_path ) );
        $file_path =  dirname( $file_path ) . DIRECTORY_SEPARATOR;

        return $file_path;
    }

    public static function get_dir_url( $file_path = __FILE__ ) {

        $file_path = wp_normalize_path( realpath( $file_path ) );

        $rel_url = str_replace( self::$data['plugin_dir_path'], '', $file_path );
        $rel_url = dirname( $rel_url ) . '/';

        $dir_url = self::$data['plugin_dir_url'] . $rel_url;

        return $dir_url;
    }
}