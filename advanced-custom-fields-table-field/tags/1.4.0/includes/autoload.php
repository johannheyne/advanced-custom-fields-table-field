<?php

/**
 * Enables autoload of table field classes
 */

spl_autoload_register(function ($class) {

    if ( strpos( $class, 'ACFTablefield\\' ) === false ) {

        return;
    }

    $base_dir = rtrim( __DIR__, 'includes' ) . 'classes' . DIRECTORY_SEPARATOR;
    $relative_class = str_replace('ACFTablefield\\', '', $class) . '.php';
    $file = $base_dir . $relative_class;

    if ( file_exists( $file ) ) {

        require_once( $file );
    }
});
