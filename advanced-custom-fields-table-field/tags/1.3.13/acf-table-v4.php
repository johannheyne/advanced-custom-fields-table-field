<?php

	class acf_table_add_on extends acf_field
	{
		// vars
		var $settings, // will hold info such as dir / path
			$defaults; // will hold default field options

		/*
		*  __construct
		*
		*  Set name / label needed for actions / filters
		*
		*  @since   3.6
		*  @date	23/01/13
		*/

		function __construct()
		{
			// language
			load_textdomain( 'acf-table', dirname(__FILE__) . '/lang/acf-table-' . get_locale() . '.mo' );

			$this->name = 'table';
			$this->label = __( 'Table','acf-table' );
			$this->category = __( 'Layout', 'acf' ); // Basic, Content, Choice, etc
			$this->defaults = array(
				'use_header' => 0,
				'use_caption' => 2,
				// add default here to merge into your field.
				// This makes life easy when creating the field options as you don't need to use any if( isset('') ) logic. eg:
				//'preview_size' => 'thumbnail'
			);

			// do not delete!
			parent::__construct();

			// settings
			$this->settings = array(
				'dir_url' => plugins_url( '', __FILE__ ) . '/',
				'version' => '1.3.13',
			);

			// PREVENTS SAVING INVALID TABLE FIELD JSON DATA {

				if (
					! defined( 'ACF_TABLEFIELD_FILTER_POSTMETA' ) OR
					constant( 'ACF_TABLEFIELD_FILTER_POSTMETA' ) === true
				) {

					add_filter( 'update_post_metadata', function( $x, $object_id, $meta_key, $meta_value, $prev_value ) {

						// detecting ACF table json
						if (
							is_string( $meta_value ) and
							strpos( $meta_value, '"acftf":{' ) !== false
						) {

							// is new value a valid json string
							json_decode( $meta_value );

							if ( json_last_error() !== JSON_ERROR_NONE ) {

								// canceling meta value uptdate
								error_log( 'The plugin advanced-custom-fields-table-field prevented a third party update_post_meta( ' . $object_id . ', "' . $meta_key . '", $value ); action that would save a broken JSON string.' . "\n" . 'For details see https://codex.wordpress.org/Function_Reference/update_post_meta#Character_Escaping.' );
								return true;
							}
						}

						return $x;

					}, 10, 5 );
				}

			// }

		}

		/*
		*  create_field()
		*
		*  Create the HTML interface for your field
		*
		*  @param   $field - an array holding all the field's data
		*
		*  @type	action
		*  @since   3.6
		*  @date	23/01/13
		*/

		function create_field( $field )
		{

			$data_field['use_header'] = $field['use_header'];
			$data_field['use_caption'] = $field['use_caption'];

			$e = '';

			$e .= '<div class="acf-table-root">';

				$e .= '<div class="acf-table-optionwrap">';

					// OPTION HEADER {

						if ( $data_field['use_header'] === 0 ) {

							$e .= '<div class="acf-table-optionbox">';
								$e .= '<label>' . __( 'use table header', 'acf-table' ) . ' </label>';
								$e .= '<select class="acf-table-optionbox-field acf-table-fc-opt-use-header" name="acf-table-opt-use-header">';
									$e .= '<option value="0">' . __( 'No', 'acf-table' ) . '</option>';
									$e .= '<option value="1">' . __( 'Yes', 'acf-table' ) . '</option>';
								$e .= '</select>';
							$e .= '</div>';
						}

					// }

					// OPTION CAPTION {

						if ( $data_field['use_caption'] === 1 ) {

							$e .= '<div class="acf-table-optionbox">';
								$e .= '<label for="acf-table-opt-caption">' . __( 'table caption', 'acf-table' ) . ' </label><br>';
								$e .= '<input class="acf-table-optionbox-field acf-table-fc-opt-caption" id="acf-table-opt-caption" type="text" name="acf-table-opt-caption" value=""></input>';
							$e .= '</div>';
						}

					// }

				$e .= '</div>';

				if ( is_array( $field['value'] ) ) {

					$field['value'] = wp_json_encode( $field['value'] );
				}

				if ( is_string( $field['value'] ) ) {

					if ( substr( $field['value'] , 0 , 1 ) === '{' ) {

						$field['value'] = urlencode( $field['value'] );
					}
				}

				$e .= '<div class="acf-input-wrap">';
					$e .= '<input type="hidden" data-field-options="' . urlencode( wp_json_encode( $data_field ) ) . '" id="' . $field['id'] . '"  class="' . $field['class'] . '" name="' . $field['name'] . '" value="' . $field['value'] . '"/>';
				$e .= '</div>';

			$e .= '</div>';

			echo $e;

		}

		/*
		*  input_admin_enqueue_scripts()
		*
		*  This action is called in the admin_enqueue_scripts action on the edit screen where your field is created.
		*  Use this action to add css + javascript to assist your create_field() action.
		*
		*  $info	http://codex.wordpress.org/Plugin_API/Action_Reference/admin_enqueue_scripts
		*  @type	action
		*  @since   3.6
		*  @date	23/01/13
		*/

		function input_admin_enqueue_scripts()
		{
			// Note: This function can be removed if not used

			/// scripts
			wp_enqueue_script( 'acf-input-table', $this->settings['dir_url'] . 'js/input-v4.js', array( 'jquery', 'acf-input' ), $this->settings['version'], true );

			// styles
			wp_register_style( 'acf-input-table', $this->settings['dir_url'] . 'css/input.css', array( 'acf-input' ), $this->settings['version'] );
			wp_enqueue_style(array(
				'acf-input-table',
			));
		}

		/*
		*  create_options()
		*
		*  Create extra options for your field. This is rendered when editing a field.
		*  The value of $field['name'] can be used (like bellow) to save extra data to the $field
		*
		*  @type	action
		*  @since   3.6
		*  @date	23/01/13
		*
		*  @param   $field  - an array holding all the field's data
		*/

		function create_options($field)
		{
			// defaults?
			/*
			$field = array_merge($this->defaults, $field);
			*/

			// key is needed in the field names to correctly save the data
			$key = $field['name'];

			if ( empty( $field['use_header'] ) ) {

				$field['use_header'] = 0;
			}

			if ( empty( $field['use_caption'] ) ) {

				$field['use_caption'] = 2;
			}

			// Create Field Options HTML

			// USE HEADER

			echo '<tr class="field_option field_option_' . $this->name . '">';
				echo '<td class="label">';
					echo '<label>' . __( "Table Header", 'acf-table' ) . '</label>';
					echo '<p class="description">' . __( "Presetting the usage of table header", 'acf-table' ) . '</p>';
				echo '</td>';
				echo '<td>';

						do_action('acf/create_field', array(
							'type'	=>  'radio',
							'name'	=>  'fields[' . $key . '][use_header]',
							'value'   =>  $field['use_header'],
							'choices'   =>  array(
								0   =>  __( "Optional", 'acf-table' ),
								1   =>  __( "Yes", 'acf-table' ),
								2   =>  __( "No", 'acf-table' ),
							),
							'layout'	=>  'horizontal',
							'default_value'	=> 0,
						));

				echo '</td>';
			echo '</tr>';

			// USER CAPTION

			echo '<tr class="field_option field_option_' . $this->name . '">';
				echo '<td class="label">';
					echo '<label>' . __( "Table Caption", 'acf-table' ) . '</label>';
					echo '<p class="description">' . __( "Presetting the usage of table caption", 'acf-table' ) . '</p>';
				echo '</td>';
				echo '<td>';

						do_action('acf/create_field', array(
							'type'	=>  'radio',
							'name'	=>  'fields[' . $key . '][use_caption]',
							'value'   =>  $field['use_caption'],
							'choices'   =>  array(
								1   =>  __( "Yes", 'acf-table' ),
								2   =>  __( "No", 'acf-table' ),
							),
							'layout'	=>  'horizontal',
							'default_value'	=> 2,
						));

				echo '</td>';
			echo '</tr>';

		}

		/*
		*  format_value()
		*
		*  This filter is appied to the $value after it is loaded from the db and before it is passed to the create_field action
		*
		*  @type	filter
		*  @since   3.6
		*  @date	23/01/13
		*
		*  @param   $value  - the value which was loaded from the database
		*  @param   $post_id - the $post_id from which the value was loaded
		*  @param   $field  - the field array holding all the field options
		*
		*  @return  $value  - the modified value
		*/

		function format_value_for_api( $value, $post_id, $field )
		{
			if ( is_string( $value ) ) {

				// CHECK FOR GUTENBERG BLOCK CONTENT (URL ENCODED JSON) {

					if ( substr( $value , 0 , 1 ) === '%' ) {

						$value = urldecode( $value );
					}

				// }

				$value = json_decode( $value, true ); // decode gutenberg JSONs, but also old table JSONs strings to array
			}

			$a = $value;

			$value = false;

			// IF BODY DATA

			if (
				! empty( $a['b'] ) AND
				count( $a['b'] ) > 0
			) {

				// IF HEADER DATA

				if ( ! empty( $a['p']['o']['uh'] ) ) {

					$value['header'] = $a['h'];
				}
				else {

					$value['header'] = false;
				}

				// IF CAPTION DATA

				if (
					! empty( $field['use_caption'] ) AND
					$field['use_caption'] === 1 AND
					! empty( $a['p']['ca'] )
				) {

					$value['caption'] = $a['p']['ca'];
				}
				else {

					$value['caption'] = false;
				}

				// BODY

				$value['body'] = $a['b'];

				// IF SINGLE EMPTY CELL, THEN DO NOT RETURN TABLE DATA

				if (
					count( $a['b'] ) === 1
					AND count( $a['b'][0] ) === 1
					AND trim( $a['b'][0][0]['c'] ) === ''
				) {

					$value = false;
				}
			}

			return $value;
		}

		/*
		*  update_value()
		*
		*  This filter is appied to the $value before it is updated in the db
		*
		*  @type	filter
		*  @since   3.6
		*  @date	23/01/13
		*
		*  @param   $value - the value which will be saved in the database
		*  @param   $post_id - the $post_id of which the value will be saved
		*  @param   $field - the field array holding all the field options
		*
		*  @return  $value - the modified value
		*/

		function update_value($value, $post_id, $field)
		{
			if ( is_string( $value ) ) {

				$value = wp_unslash( $value );
				$value = urldecode( $value );
				$value = json_decode( $value, true );
			}

			// UPDATE via update_field() {

				if (
					isset( $value['header'] ) OR
					isset( $value['body'] )
				) {

					// try post_meta
					$data = get_post_meta( $post_id, $field['name'], true );

					// try term_meta
					if ( empty( $data ) ) {

						$data = get_term_meta( str_replace('term_', '', $post_id ), $field['name'], true );
					}

					// prevents updating a field, thats data are not defined yet
					if ( empty( $data ) ) {

						return false;
					}

					if ( is_string( $data ) ) {

						$data = json_decode( $data, true );
					}

					if ( isset( $value['use_header'] ) ) {

						$data['p']['o']['uh'] = 1;
					}

					if ( isset( $value['caption'] ) ) {

						$data['p']['ca'] = $value['caption'];
					}

					if (
						isset( $value['header'] ) AND
						$value['header'] !== false
					 ) {

						$data['h'] = $value['header'];
					}

					if ( isset( $value['body'] ) ) {

						$data['b'] = $value['body'];
					}

					$value = $data;
				}

			// }

			$value = $this->table_slash( $value );

			return $value;
		}

		/**
		* table_slash()
		*
		* Add slashes to a string or strings in an array.
		*
		* This should be used instead of wp_slash() because wp_slash() convertes all
		* array values to strings which affects also the table object values of
		* type number converting to string.
		*/

		function table_slash( $value ) {

			if ( is_array( $value ) ) {

				foreach ( $value as $k => $v ) {

					if (
						is_array( $v ) OR
						is_object( $v )
					) {
						$value[ $k ] = $this->table_slash( $v );
					}
					else if( is_string( $v ) ) {

						$value[ $k ] = addslashes( $v );
					}
					else {

						$value[ $k ] = $v;
					}
				}

			} else {

				$value = addslashes( $value );
			}

			return $value;
		}

	}

	// create field
	new acf_table_add_on();
