=== Advanced Custom Fields: Table Field ===
Contributors: Johann Heyne
Tags: acf table
Requires at least: 4.8
Tested up to: 4.9
Stable tag: trunk
License: GPLv2 or later

A Table Field Add-on for the Advanced Custom Fields Plugin

== Description ==

The Table field plugin enables easily editing a table.
The plugin is compatible with ACF4 and ACF5.
The table field works also with the repeater and flexible field types.

* table header (option)
* add and remove table columns and rows
* change order of columns and rows by dragging
* to move to the next cells editor press key: tab
* to move to the previous cells editor press key: shift + tab

=== Output Table HTML ===

To render the table fields data as an html table in one of your template files you can start with the following basic code example:

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
=== Line Breaks ===

This is about displaying line breaks in the admin tables and getting line breaks as `<br>` when outputting the tables HTML.

= Converting Line Breaks for HTML Output =

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

= Displaying Line Breaks in Editing Tables =

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


== Changelog ==

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
