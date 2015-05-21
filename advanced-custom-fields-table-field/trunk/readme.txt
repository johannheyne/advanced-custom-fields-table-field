=== Advanced Custom Fields: Table Field ===
Contributors: jonua
Tags: acf table
Requires at least: 4.1.0
Tested up to: 4.2.1
Stable tag: trunk
License: GPLv2 or later

A Table Field Add-on for the Advanced Custom Fields Plugin

== Description ==

The Table field plugin enables easely editing a table.  
The plugin ist compatible with ACF4 and ACF5.  
The table field works also with the repeater and flexible field types.

* table header (option)
* add and remove table columns and rows
* change order of columns and rows by dragging

To display the table fields data as an html table you can start with the following code.

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

= 1.0.7 =
* Use wp_json_encode() instead of json_encode(). This may fix issues in rare enviroments.

= 1.0.6 =
* If the table has only a single empty cell (this is by default), no table data will return now.

= 1.0.5 =
* Fixed javascript issue in IE 8.
* Fixed missing table borders and table header´s height in FireFox.

= 1.0.4 =
* Fixed an uri problem on some hosts.

= 1.0.3 =
* Fixed an php error on HTTP_REFFERER.

= 1.0.2 =
* Fixed error when including the plugin from inside a theme.

= 1.0.1 =
* Fixed ACF validation error "required" when header option "use table header" was used and unchecked.

= 1.0 =
* Official Release of the free version
