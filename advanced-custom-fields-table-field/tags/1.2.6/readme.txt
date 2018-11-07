=== Advanced Custom Fields: Table Field ===
Contributors: jonua
Tags: acf table
Requires at least: 4.9
Tested up to: 4.9.8
Stable tag: 1.2.6
Requires PHP: 7.0.0
License: GPLv2 or later

A Table Field Add-on for the Advanced Custom Fields Plugin.

== Description ==

The Table Field Plugin enhances the functionality of the ["Advanced Custom Fields" plugin](https://de.wordpress.org/plugins/advanced-custom-fields/) with easy-to-edit tables.

This plugin requires the ["Advanced Custom Fields" plugin](https://de.wordpress.org/plugins/advanced-custom-fields/) or the [Pro version](https://www.advancedcustomfields.com/pro/)!

The table field works also with the repeater and flexible field types.

= Features =
* Table Header (Option)
* Add and remove table columns and rows
* Change order of columns and rows by dragging
* To move to the next cells editor press key: tab
* To move to the previous cells editor press key: shift + tab

== Frequently Asked Questions ==

= How to output the table html? =

To render the table fields data as an html table in one of your template files (page.php, single.php) you can start with the following basic code example:

`
$table = get_field( 'your_table_field_name' );

if ( $table ) {

	echo '<table border="0">';

		if ( $table['header'] ) {

			echo '<thead>';

				echo '<tr>';

					foreach ( $table['header'] as $th ) {

						echo '<th>';
							echo $th['c'];
						echo '</th>';
					}

				echo '</tr>';

			echo '</thead>';
		}

		echo '<tbody>';

			foreach ( $table['body'] as $tr ) {

				echo '<tr>';

					foreach ( $tr as $td ) {

						echo '<td>';
							echo $td['c'];
						echo '</td>';
					}

				echo '</tr>';
			}

		echo '</tbody>';

	echo '</table>';
}
`

= How to handle line breaks? =

This is about displaying line breaks in the admin tables and getting line breaks as `<br>` when outputting the tables HTML.

**Converting Line Breaks for HTML Output**

To convert line breaks to `<br>` in tables HTML output the PHP function `nl2br()` can be used:

For line breaks in **table header cells** replace…
`
echo $th['c'];
`
with…
`
echo nl2br( $th['c'] );
`

For line breaks in **table body cells** replace…
`
echo $td['c'];
`
with…
`
echo nl2br( $td['c'] );
`

**Displaying Line Breaks in Editing Tables**

To display natural line breaks in the editing tables in the admin area, add the following styles to the admin area.

`
.acf-table-header-cont,
.acf-table-body-cont {
    white-space: pre-line;
}
`

One way to add these styles to the WordPress admin area is adding the following code to your functions.php file of the theme.

`
add_action('admin_head', 'acf_table_styles');

function acf_table_styles() {
  echo '<style>
    .acf-table-header-cont,
    .acf-table-body-cont {
        white-space: pre-line;
    }
  </style>';
}
`

= How to use the table field in Elementor Page Builder? =

In general, its up to Elementor to support ACF field types on the Elementor widgets. All supported ACF fields by Elementor [you can find here](https://docs.elementor.com/article/381-elementor-integration-with-acf). But because the table field is not a native ACF field, the support for this field may never happen.

For now the way to go is using the Elementors shortcode Widget. Before you can use a shortcode to display a table fields table, you have to setup a shortcode in functions.php. The following code does this. You can modify the table html output for your needs.

`function shortcode_acf_tablefield( $atts ) {

    $a = shortcode_atts( array(
        'field-name' => false,
        'post-id' => false,
    ), $atts );

    $table = get_field( $a['field-name'], $a['post-id'] );

    $return = '';

    if ( $table ) {

        $return .= '<table border="0">';

            if ( $table['header'] ) {

                $return .= '<thead>';

                    $return .= '<tr>';

                        foreach ( $table['header'] as $th ) {

                            $return .= '<th>';
                                $return .= $th['c'];
                            $return .= '</th>';
                        }

                    $return .= '</tr>';

                $return .= '</thead>';
            }

            $return .= '<tbody>';

                foreach ( $table['body'] as $tr ) {

                    $return .= '<tr>';

                        foreach ( $tr as $td ) {

                            $return .= '<td>';
                                $return .= $td['c'];
                            $return .= '</td>';
                        }

                    $return .= '</tr>';
                }

            $return .= '</tbody>';

        $return .= '</table>';
    }

    return $return;
}

add_shortcode( 'table', 'shortcode_acf_tablefield' );`


Then use the shortcode in a Elementors shortcode widget like this, to **insert a table from the current page or post**…

`[table field-name="your table field name"]`

You also can **insert a table from another page or post**…

`[table field-name="your table field name" post-id="123"]`

Or you can **insert a table from a ACF option page**…

`[table field-name="your table field name" post-id="option"]`

== Installation ==

This software can be used as both a WP plugin and a theme include.
However, only when activated as a plugin will updates be available.

= Plugin =
1. Copy the "advanced-custom-fields-table-field" folder into your plugins folder.
2. Activate the plugin via the Plugins admin page.


== Screenshots ==

1. The Field Settings

2. The Field Content Editing

2. Grab the rows and columns in the grey area and drag them.


== Translations ==

* English - default, always included
* German: Deutsch - immer dabei!
* Danish: Dansk - altid der!
* Polish: Polski - zawsze tam jest!

*Note:* Please [contribute your language](https://translate.wordpress.org/projects/wp-plugins/advanced-custom-fields-table-field) to the plugin to make it even more useful.


== Upgrade Notice ==

= 1.2.6 =
Fixes an PHP error and improves JavaScript code.


== Changelog ==

= 1.2.6 =
* Replaces jQuery.noConflict methode
* Prevents PHP error if table fields value is from a previous fieldtype

= 1.2.5 =
* Adds danish translation, thanks to Jeppe Skovsgaard

= 1.2.4 =
* Fixes backslashes on using update_field();

= 1.2.3 =
* Adds support for the ACF update_field() function. If you get the table fields data array by get_field(), you can change the table data array and using update_field() to save the changes to the field.

= 1.2.2 =
* Adds plugin version to table data for handling structural changes.
* Fixes loosing table data containing quotes on third party update_post_meta() actions to table field values. Limited to new fields or fields value changed since plugin version 1.2.2.
* Fixes an PHP warning since PHP 7.2 when body data is null

= 1.2.1 =
* Fixes not using user locale for translation
* Adds description for handling line breaks to plugins page

= 1.2 =
* Adds support for tab navigation. Uses shift + tab for backward navigation.
* Minor code improvements

= 1.1.16 =
* Keeps the WordPress admin area working, if tablefields value is not a valid JSON string. Logs the invalid value in the console for debugging.

= 1.1.15 =
* Adds polish translation by Pawel Golka

= 1.1.14 =
* Fixes table does not appear under certain field groups location rules

= 1.1.13 =
* Fixes an XSS issue within /wp-admin/ pages

= 1.1.12 =
* Adds support for field groups post taxonomy rule

= 1.1.11 =
* Fixes rerendering of tables while changing other content

= 1.1.10 =
* Fixed table functionality with respect to the ACF rules

= 1.1.9 =
* Fixes returning false on single empty table cell for ACF version 4

= 1.1.8 =
* Fixes support for user edit pages

= 1.1.7 =
* Fixes support for user profile pages

= 1.1.6 =
* UI: Fixes table header switch off problem

= 1.1.5 =
* Fixes issue occured after database migration with plugin "WP Migrate DB"

= 1.1.4 =
* Takes over icon class changes in ACF-Pro since version 5.3.2

= 1.1.3 =
* Fixes wrong function name 'change_template'

= 1.1.2 =
* Fixes missing table on page template change

= 1.1.1 =
* Compatibility to icon changes of ACF Pro version 5.2.8
* Fixes table top legend height in FireFox
* Fixes delete column icon position in IE

= 1.1 =
* Improved User Experience when deleting all columns and rows.
* Compatibility to changes of ACF Pro version 5.2.7.

= 1.0.7 =
* Use wp_json_encode() instead of json_encode(). This may fix issues in rare enviroments.

= 1.0.6 =
* If the table has only a single empty cell (this is by default), no table data will return now.

= 1.0.5 =
* Fixes javascript issue in IE 8.
* Fixes missing table borders and table header´s height in FireFox.

= 1.0.4 =
* Fixes an uri problem on some hosts.

= 1.0.3 =
* Fixes an php error on HTTP_REFFERER.

= 1.0.2 =
* Fixes error when including the plugin from inside a theme.

= 1.0.1 =
* Fixes ACF validation error "required" when header option "use table header" was used and unchecked.

= 1.0 =
* Official Release of the free version
