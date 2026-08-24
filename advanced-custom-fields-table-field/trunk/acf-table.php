<?php
/*
Plugin Name: Table Field Add-on for ACF and SCF
Plugin URI: https://www.acf-table-field.com
Description: This free Add-on adds a table field type for the plugins Advanced Custom Fields and Secure Custom Fields.
Version: 1.4.0
Author: Johann Heyne
Author URI: http://www.johannheyne.de
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: advanced-custom-fields-table-field
Domain Path: /languages
*/

namespace ACFTablefield;

use ACFTablefield\PluginClasses;
use ACFTablefield\PluginInfo;

if ( ! defined( 'ABSPATH' ) ) {

	exit; // Exit if accessed directly
}

add_action( 'init', function(){

	/**
	 * Exits if plugin already exits
	 */

	if ( defined( 'ACF_TABLE_FIELD_PLUGIN_VERSION' ) ) {

		return;
	}

	/**
	 * Exits if ACF is not present
	 */

	if ( ! function_exists( 'acf_register_field_type' ) ) {

		return;
	}

	/**
	 * Defines current plugin version.
	 * Start at version 1.0.0 and use SemVer - https://semver.org
	 */

	define( 'ACF_TABLE_FIELD_PLUGIN_VERSION', '1.4.0' /* Plugin Version */ );

	/**
	 * Loads files
	 */

	require_once( __DIR__ . '/includes/autoload.php');
	require_once( __DIR__ . '/integrations/polylang/init.php' );

	/**
	 * Inits settings page
	 */

	if ( is_admin() ) {

		new PluginSettingsPage();
	}

	/**
	 * Loads text domain
	 */

	load_plugin_textdomain( PluginInfo::get('text_domain'), false, PluginInfo::get('plugin_dir_name') . '/languages/' );

	/**
	 * Registers field with ACF
	 */

	PluginClasses::$classes['Field'] = acf_register_field_type( '\ACFTablefield\Field' );

} );
