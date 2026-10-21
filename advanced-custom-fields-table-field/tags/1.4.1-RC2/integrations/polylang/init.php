<?php

	if ( class_exists( 'Polylang' ) && function_exists( 'acf_render_field_setting' ) ) {

		add_action( 'acf/render_field_settings/type=table', function( $field ) {

			$choices = array(
				'ignore'    => __( 'Ignore', 'polylang-pro' ),
				'copy_once' => __( 'Copy once', 'polylang-pro' ),
				'translate'      => __( 'Translate', 'polylang-pro' ),
				'translate_once' => __( 'Translate once', 'polylang-pro' ),
				'sync'      => __( 'Synchronize', 'polylang-pro' ),
			);

			$default = 'translate';

			acf_render_field_setting( // Since ACF 5.7.10.
				$field,
				array(
					'label'         => __( 'Translations', 'polylang-pro' ),
					'instructions'  => '',
					'name'          => 'translations',
					'type'          => 'select',
					'choices'       => $choices,
					'default_value' => $default,
				),
				false // The setting is depending on the type of field.
			);
		});
	}
