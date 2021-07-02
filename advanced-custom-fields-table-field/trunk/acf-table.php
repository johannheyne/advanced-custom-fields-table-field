<?php
/*
Plugin Name: Advanced Custom Fields: Table Field
Plugin URI: http://www.johannheyne.de/
Description: This free Add-on adds a table field type for the Advanced Custom Fields plugin.
Version: 1.3.14
Author: Johann Heyne
Author URI: http://www.johannheyne.de/
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: acf-table
Domain Path: /lang/
*/

// 1. set text domain
// Reference: https://codex.wordpress.org/Function_Reference/load_plugin_textdomain
function acf_table_load_plugin_textdomain( $version ) {

	load_plugin_textdomain( 'acf-table', false, dirname( plugin_basename(__FILE__) ) . '/lang/' );
}

add_action('plugins_loaded', 'acf_table_load_plugin_textdomain');


// 2. Include field type for ACF5
// $version = 5 and can be ignored until ACF6 exists
function include_field_types_table( $version ) {

	include_once('acf-table-v5.php');
}

add_action('acf/include_field_types', 'include_field_types_table');

// 3. Include field type for ACF4
function register_fields_table() {

	include_once('acf-table-v4.php');
}

add_action('acf/register_fields', 'register_fields_table');
