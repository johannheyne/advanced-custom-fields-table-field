<?php

namespace ACFTablefield;

use ACFTablefield\PluginInfo;

class PluginSettingsPage {

	private $settings;

	private $data;

	private $is_api_call = false;
	private $api_response = null;

	private $docs_url = 'https://www.acf-table-field.com/docs/';
	private $github_doc_url = 'https://github.com/johannheyne/acf-table-field-support/issues/new/choose';
	private $website_url = 'https://www.acf-table-field.com';
	private $wordpress_website_url = 'https://wordpress.org/plugins/advanced-custom-fields-table-field/';
	private $website_url_pricing = 'https://www.acf-table-field.com#pricing';
	private $wordpress_repository_support_url = 'https://wordpress.org/support/plugin/advanced-custom-fields-table-field/';

	private $support_mail_adress = 'support@acf-table-field.com';
	private $support_mail_link = 'mailto:support@acf-table-field.com?subject=ACF Table Field #ticket-';

	public function __construct() {

		add_action( 'admin_menu', array( $this, 'init_settings_page' ) );
		add_action( 'admin_init', array( $this, 'init_options_settings' ) );
		add_action( 'admin_init', array( $this, 'init_options_data' ) );
		add_action( 'update_option_acf_table_field_plugin_settings', array( $this, 'handle_license_activation' ), 10, 3 );
		add_action( 'current_screen', array( $this, 'register_styles' ) );
		add_action( 'current_screen', array( $this, 'remove_all_help_tabs' ) );
	}

	public static function is_settings_page() {

		$screen = get_current_screen();

		if (
				$screen && $screen->id !== 'acf_page_acf-table-field-plugin-settings' &&
				$screen && $screen->id !== 'scf_page_acf-table-field-plugin-settings'
		) {

			return false;
		}

		return true;
	}

	public function remove_all_help_tabs() {

		if ( ! $this->is_settings_page() ) {

			return;
		}

		$screen = get_current_screen();
		$screen->remove_help_tabs();
	}

	public function register_styles() {

		if ( ! $this->is_settings_page() ) {

			return;
		}

		if ( version_compare( get_bloginfo('version'), '7.0', '<' ) ) {

			wp_register_style( 'acf-table-settings-page', FileSystem::get('plugin_dir_url') . 'css/settings-wpv6.css', array( 'acf-global' ), PluginInfo::get('version') );
		}
		else {

			wp_register_style( 'acf-table-settings-page', FileSystem::get('plugin_dir_url') . 'css/settings.css', array( 'acf-global' ), PluginInfo::get('version') );
		}

		wp_enqueue_style( 'acf-table-settings-page' );
	}

	private function _get_option( $option_name ) {

		if ( $this->_is_license_site() ) {

			$option = get_option( $option_name );
		}
		else {

			$main_site_id = get_network()->site_id;

			switch_to_blog( $main_site_id );

			$option = get_option( $option_name );

			restore_current_blog();
		}

		return $option;
	}

	private function _update_option( $option_name, $value ) {

		update_option( $option_name, $value );
	}

	private function _is_license_site() {

		if (
			! is_multisite() ||
			get_current_blog_id() === get_network()->site_id
		) {

			return true;
		}

		return false;
	}

	public function init_options_settings() {

		$this->settings = $this->_get_option( 'acf_table_field_plugin_settings' );

		if ( empty( $this->settings ) ) {

			$this->settings = array();
		}

		$defaults = array(

		);

		$this->settings = array_replace_recursive( $defaults, $this->settings );

		$this->_update_option( 'acf_table_field_plugin_settings', $this->settings );
	}

	public function init_options_data() {

		$this->data = $this->_get_option( 'acf_table_field_plugin_data' );

		if ( empty( $this->data ) ) {

			$this->data = array();
		}

		$defaults = array(

		);

		$this->data = array_replace_recursive( $defaults, $this->data );

		$this->_update_option( 'acf_table_field_plugin_data', $this->data );
	}

	public function init_settings_page() {

		add_submenu_page(
			'edit.php?post_type=acf-field-group', // slug still works also for SCF
			'Table Field', // page_title
			'Table Field', // menu_title
			'manage_options', // capability
			'acf-table-field-plugin-settings', // option page menu_slug
			array( $this, 'settings_page_view' ) // function
		);

		register_setting(
			'acf_table_field_plugin_settings_option_group', // option_group
			'acf_table_field_plugin_settings', // option_name
			array( $this, 'settings_data_sanitize' ) // sanitize_callback
		);

		add_filter('admin_body_class', function ($classes) {

			if ( ! $this->is_settings_page() ) {

				return $classes;
			}

			$classes .= ' acf-admin-page';

			return $classes;
		});

	}

	public function settings_page_view() {

		?>

		<div class="acf-headerbar"><h1 class="acf-page-title"><?php _ex( 'Table Field Plugin', 'settings', PluginInfo::get('text_domain') ); ?> </h1></div>

		<div class="wrap acf-settings-wrap" style="margin-top: 48px;">

			<?php

				do_action('admin_notices');
				do_action('all_admin_notices');

			?>

			<div class="acf-box">
				<div class="title"><h3><?php _ex( 'Info', 'settings', PluginInfo::get('text_domain') ); ?></h3></div>
				<div class="inner" style="padding: 24px;">
					<p><?php echo sprintf( _x( 'WordPress Repository Website<br><a target="_blank" href="%s">%s</a>', 'settings', PluginInfo::get('text_domain') ), $this->wordpress_website_url, $this->wordpress_website_url ); ?></p>
					<p><?php echo sprintf( _x( 'For <b>support</b>, please use the plugin’s official <a target="_blank" rel="noopener" href="%s">WordPress support forum</a>. <br>I appreciate any feedback.<br>Cheers, Johann', 'settings', PluginInfo::get('text_domain') ), $this->wordpress_repository_support_url ); ?></p>
				</div>
			</div>

			<div class="acf-box">
				<div class="title"><h3><?php _ex( 'Pro Version', 'settings', PluginInfo::get('text_domain') ); ?></h3></div>
				<div class="inner" style="padding: 24px;">
					<p><b>Table Field Pro</b> brings clarity, organization and powerful configurability to your data workflows — with a modern UI, advanced editing tools, and productivity features built for real‑world projects.</p>
					<p>Whether you're managing product data, pricing tables, schedules, technical specs, charts, or capturing structured input through an ACF form:<br>
					<b>Pro gives you the control, flexibility and a clean, intuitive UI you always wanted.</b></p>
					<p>Get the Pro version at: <?php echo sprintf( _x( '<a target="_blank" href="%s">%s</a>', 'settings', PluginInfo::get('text_domain') ), $this->website_url, str_replace( 'https://www.', '', $this->website_url ) ); ?></p>
					<p style="margin-top: 2em;"><i>By choosing the Pro version, you help ensure the ongoing maintenance and long-term preservation of this open‑source version.</i></p>
				</div>
			</div>

		</div>

<?php
	}
}