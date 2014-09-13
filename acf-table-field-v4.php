<?php

	class acf_table_field extends acf_field
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
			load_textdomain( 'acf-table-field', dirname(__FILE__) . '/lang/acf-table-field-' . get_locale() . '.mo' );
			
			
			$this->name = 'table';
			$this->label = __( 'Table','acf-table-field' );
			$this->category = __( 'Layout', 'acf' ); // Basic, Content, Choice, etc
			$this->defaults = array(
				'use_header' => 0,
				// add default here to merge into your field.
				// This makes life easy when creating the field options as you don't need to use any if( isset('') ) logic. eg:
				//'preview_size' => 'thumbnail'
			);

			// do not delete!
			parent::__construct();

			
			// settings
			$this->settings = array(
				'path' => apply_filters( 'acf/helpers/get_path', __FILE__ ),
				'dir' => apply_filters( 'acf/helpers/get_dir', __FILE__ ),
				'version' => '1.0.0'
			);

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

			$e = '';

			$e .= '<div class="acf-table-field-root">';

				// OPTION HEADER {

				if ( $data_field['use_header'] === 0 ) {

					$e .= '<div class="acf-table-field-optionbox">';
						$e .= '<label><input name="acf-table-field-opt-use-header" class="acf-table-field-fc-opt-use-header" type="checkbox"/> ' . __( 'use table header', 'acf-table-field' ) . '</label>';
					$e .= '</div>';
				}

				// }

				$e .= '<div class="acf-input-wrap">';
					$e .= '<input type="hidden" data-field-options="' . urlencode( json_encode( $data_field ) ) . '" id="' . $field['id'] . '"  class="' . $field['class'] . '" name="' . $field['name'] . '" value="' . urlencode( $field['value'] ) . '"/>';
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

			// register acf scripts
			wp_register_script('acf-input-table', $this->settings['dir'] . 'js/input.js', array('acf-input'), $this->settings['version']);
			wp_register_style('acf-input-table', $this->settings['dir'] . 'css/input.css', array('acf-input'), $this->settings['version']);

			// scripts
			wp_enqueue_script(array(
				'acf-input-table',
			));

			// styles
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

			// Create Field Options HTML

			// USER HEADER

			echo '<tr class="field_option field_option_' . $this->name . '">';
				echo '<td class="label">';
					echo '<label>' . __( "Table Header", 'acf-table-field' ) . '</label>';
					//echo '<p class="description">' . __( "", 'acf' ) . '</p>';
				echo '</td>';
				echo '<td>';

						do_action('acf/create_field', array(
							'type'	=>  'radio',
							'name'	=>  'fields[' . $key . '][use_header]',
							'value'   =>  $field['use_header'],
							'choices'   =>  array(
								0   =>  __( "Optional", 'acf-table-field' ),
								1   =>  __( "Yes", 'acf-table-field' ),
								2   =>  __( "No", 'acf-table-field' ),
							),
							'layout'	=>  'horizontal',
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
			$a = json_decode( $value, true );

			$value = false;

			// IF BODY DATA

			if ( count( $a['b'] ) > 0 ) {

				// IF HEADER DATA

				if ( $a['p']['o']['uh'] === 1 ) {

					$value['header'] = $a['h'];
				}
				else {

					$value['header'] = false;
				}

				// BODY

				$value['body'] = $a['b'];
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
			$value = urldecode( str_replace( '%5C', '%5C%5C', $value ) );

			return $value;
		}
	}

	// create field
	new acf_table_field();

?>