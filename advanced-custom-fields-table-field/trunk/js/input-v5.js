jQuery.noConflict();
jQuery( document ).ready( function( $ ) {

	function ACFTableField() {

		var t = this;

		t.version = '1.2.3';

		t.param = {};

		// DIFFERENT IN ACF VERSION 4 and 5 {

			t.param.classes = {

				btn_small:		'acf-icon small',
				// "acf-icon-plus" becomes "-plus" since ACF Pro Version 5.3.2
				btn_add_row:	'acf-icon-plus -plus',
				btn_add_col:	'acf-icon-plus -plus',
				btn_remove_row:	'acf-icon-minus -minus',
				btn_remove_col:	'acf-icon-minus -minus',
			};

			t.param.htmlbuttons = {

				add_row:		'<a href="#" class="acf-table-add-row ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_add_row + '"></a>',
				remove_row:		'<a href="#" class="acf-table-remove-row ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_remove_row + '"></a>',
				add_col:		'<a href="#" class="acf-table-add-col ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_add_col + '"></a>',
				remove_col:		'<a href="#" class="acf-table-remove-col ' + t.param.classes.btn_small + ' ' + t.param.classes.btn_remove_row + '"></a>',
			};

		// }

		t.param.htmltable = {

			body_row:	   '<div class="acf-table-body-row">' +
								'<div class="acf-table-body-left">' +
									t.param.htmlbuttons.add_row +
									'<div class="acf-table-body-cont"><!--ph--></div>' +
								'</div>' +
								'<div class="acf-table-body-right">' +
									t.param.htmlbuttons.remove_row +
								'</div>' +
							'</div>',

			top_cell:	   '<div class="acf-table-top-cell" data-colparam="">' +
								t.param.htmlbuttons.add_col +
								'<div class="acf-table-top-cont"><!--ph--></div>' +
							'</div>',

			header_cell:	'<div class="acf-table-header-cell">' +
								'<div class="acf-table-header-cont"><!--ph--></div>' +
							'</div>',

			body_cell:	  '<div class="acf-table-body-cell">' +
								'<div class="acf-table-body-cont"><!--ph--></div>' +
							'</div>',

			bottom_cell:	'<div class="acf-table-bottom-cell">' +
								t.param.htmlbuttons.remove_col +
							'</div>',

			table:		   '<div class="acf-table-wrap">' +
								'<div class="acf-table-table">' + //  acf-table-hide-header acf-table-hide-left acf-table-hide-top
									'<div class="acf-table-top-row">' +
										'<div class="acf-table-top-left">' +
											t.param.htmlbuttons.add_col +
										'</div>' +
										'<div class="acf-table-top-right"></div>' +
									'</div>' +
									'<div class="acf-table-header-row acf-table-header-hide-off">' +
										'<div class="acf-table-header-left">' +
											t.param.htmlbuttons.add_row +
										'</div>' +
										'<div class="acf-table-header-right"></div>' +
									'</div>' +
									'<div class="acf-table-bottom-row">' +
										'<div class="acf-table-bottom-left"></div>' +
										'<div class="acf-table-bottom-right"></div>' +
									'</div>' +
								'</div>' +

							'</div>',
		};

		t.param.htmleditor =	'<div class="acf-table-cell-editor">' +
									'<textarea name="acf-table-cell-editor-textarea" class="acf-table-cell-editor-textarea"></textarea>' +
								'</div>';

		t.obj = {
			body: $( 'body' ),
		};

		t.var = {
			ajax: false,
		};

		t.state = {
			'current_cell_obj': false,
			'cell_editor_cell': false,
			'cell_editor_last_keycode': false
		};

		t.init = function() {

			t.init_workflow();
		};

		t.init_workflow = function() {

			t.each_table();
			t.table_add_col_event();
			t.table_remove_col();
			t.table_add_row_event();
			t.table_remove_row();
			t.cell_editor();
			t.cell_editor_tab_navigation();
			t.prevent_cell_links();
			t.sortable_row();
			t.sortable_col();
			t.ui_event_use_header();
			t.ui_event_new_flex_field();
			t.ui_event_change_location_rule();
			t.ui_event_ajax();
		};

		t.ui_event_ajax = function() {

			$( document ).ajaxComplete( function( event ) {

				t.each_table();
			});
		}

		t.ui_event_change_location_rule = function() {

			t.obj.body.on( 'change', '[name="post_category[]"], [name="post_format"], [name="page_template"], [name="parent_id"], [name="role"], [name^="tax_input"]', function() {

				var interval = setInterval( function() {

					var table_fields = $( '.field_type-table' );

					if ( table_fields.length > 0 ) {

						t.each_table();

						clearInterval( interval );
					}

				}, 100 );

			} );

		};

		t.each_table = function( ) {

			$( '.acf-field-table .acf-table-root' ).not( '.acf-table-rendered' ).each( function() {

				var p = {};
				p.obj_root = $( this ),
				table = p.obj_root.find( '.acf-table-wrap' );

				if ( table.length > 0 ) {

					return;
				}

				p.obj_root.addClass( 'acf-table-rendered' );

				t.data_get( p );

				t.data_default( p );

				t.field_options_get( p );

				t.table_render( p );

				t.misc_render( p );

				if ( typeof p.data.b[ 1 ] === 'undefined' && typeof p.data.b[ 0 ][ 1 ] === 'undefined' && p.data.b[ 0 ][ 0 ].c === '' ) {

					p.obj_root.find( '.acf-table-remove-col' ).hide(),
					p.obj_root.find( '.acf-table-remove-row' ).hide();
				}

			} );
		};

		t.field_options_get = function( p ) {

			try {

				p.field_options = $.parseJSON( decodeURIComponent( p.obj_root.find( '[data-field-options]' ).data( 'field-options' ) ) );
			}
			catch (e) {

				p.field_options = {
					use_header: 2
				};

				console.log( 'The tablefield options value is not a valid JSON string:', decodeURIComponent( p.obj_root.find( '[data-field-options]' ).data( 'field-options' ) ) );
				console.log( 'The parsing error:', e );
			}

		};

		t.ui_event_use_header = function() {

			// HEADER: SELECT FIELD ACTIONS {

				t.obj.body.on( 'change', '.acf-table-fc-opt-use-header', function() {

					var that = $( this ),
						p = {};

					p.obj_root = that.parents( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );

					t.data_get( p );

					t.data_default( p );

					if ( that.val() === '1' ) {

						p.obj_table.removeClass( 'acf-table-hide-header' );

						p.data.p.o.uh = 1;
						t.update_table_data_field( p );
					}
					else {

						p.obj_table.addClass( 'acf-table-hide-header' );

						p.data.p.o.uh = 0;
						t.update_table_data_field( p );
					}

				} );

			// }
		};

		t.ui_event_new_flex_field = function() {

			t.obj.body.on( 'click', '.acf-fc-popup', function() {

				// SORTABLE {

					$( '.acf-table-table' )
						.sortable('destroy')
						.unbind();

					window.setTimeout( function() {

						t.sortable_row();

					}, 300 );

				// }

			} );
		};

		t.data_get = function( p ) {

			// DATA FROM FIELD {

				var val = p.obj_root.find( 'input.table' ).val();

				p.data = false;

				if ( val !== '' ) {

					try {

						p.data = $.parseJSON( decodeURIComponent( val.replace(/\+/g, '%20') ) );
					}
					catch (e) {

						p.data = false;

						console.log( 'The tablefield value is not a valid JSON string:', decodeURIComponent( val.replace(/\+/g, '%20') ) );
						console.log( 'The parsing error:', e );
					}
				}

				return p.data;

			// }

		};

		t.data_default = function( p ) {

			// DEFINE DEFAULT DATA {

				p.data_defaults = {

					acftf: {
						v: t.version,
					},

					p: {
						o: {
							uh: 0,
						},
					},

					// from data-colparam

					c: [
						{
							c: '',
						},
					],

					// header

					h: [
						{
							c: '',
						},
					],

					// body

					b: [
						[
							{
								c: '',
							},
						],
					],
				};

			// }

			// MERGE DEFAULT DATA {

				if ( p.data ) {

					if ( typeof p.data.b === 'array' ) {

						$.extend( true, p.data, p.data_defaults );
					}
				}
				else {

					p.data = p.data_defaults;
				}

			// }

		};

		t.table_render = function( p ) {

			// TABLE HTML MAIN {

				p.obj_root.find( '.acf-table-wrap' ).remove();
				p.obj_root.append( t.param.htmltable.table );

			// }

			// TABLE GET OBJECTS {

				p.obj_table = p.obj_root.find( '.acf-table-table' );
				p.obj_top_row = p.obj_root.find( '.acf-table-top-row' ),
				p.obj_top_insert = p.obj_top_row.find( '.acf-table-top-right' ),
				p.obj_header_row = p.obj_root.find( '.acf-table-header-row' ),
				p.obj_header_insert = p.obj_header_row.find( '.acf-table-header-right' ),
				p.obj_bottom_row = p.obj_root.find( '.acf-table-bottom-row' ),
				p.obj_bottom_insert = p.obj_bottom_row.find( '.acf-table-bottom-right' );

			// }

			// TOP CELLS {

				if ( p.data.c ) {

					for ( i in p.data.c ) {

						p.obj_top_insert.before( t.param.htmltable.top_cell );
					}
				}

				t.table_top_labels( p );

			// }

			// HEADER CELLS {

				if ( p.data.h ) {

					for ( i in p.data.h ) {

						p.obj_header_insert.before( t.param.htmltable.header_cell.replace( '<!--ph-->', p.data.h[ i ].c.replace( /xxx&quot/g, '"' ) ) );
					}
				}

			// }

			// BODY ROWS {

				if ( p.data.b ) {

					for ( i in p.data.b ) {

						p.obj_bottom_row.before( t.param.htmltable.body_row.replace( '<!--ph-->', parseInt(i) + 1 ) );
					}
				}

			// }

			// BODY ROWS CELLS {

				var body_rows = p.obj_root.find( '.acf-table-body-row'),
					row_i = 0;

				if ( body_rows ) {

					body_rows.each( function() {

						var body_row = $( this ),
							row_insert = body_row.find( '.acf-table-body-right' );

						for( i in p.data.b[ row_i ] ) {

							row_insert.before( t.param.htmltable.body_cell.replace( '<!--ph-->', p.data.b[ row_i ][ i ].c.replace( /xxx&quot/g, '"' ) ) );
						}

						row_i = row_i + 1
					} );
				}

			// }

			// TABLE BOTTOM {

				if ( p.data.c ) {

					for ( i in p.data.c ) {

						p.obj_bottom_insert.before( t.param.htmltable.bottom_cell );
					}
				}

			// }

		};

		t.misc_render = function( p ) {

			// VARS {

				var v = {};

				v.obj_use_header = p.obj_root.find( '.acf-table-fc-opt-use-header' );

			// }

			// HEADER {

				// HEADER: FIELD OPTIONS, THAT AFFECTS DATA {

					// HEADER IS NOT ALLOWED

					if ( p.field_options.use_header === 2 ) {

						p.obj_table.addClass( 'acf-table-hide-header' );

						p.data.p.o.uh = 0;
						t.update_table_data_field( p );
					}

					// HEADER IS REQUIRED

					if ( p.field_options.use_header === 1 ) {

						p.data.p.o.uh = 1;
						t.update_table_data_field( p );
					}

				// }

				// HEADER: SET CHECKBOX STATUS {

					if ( p.data.p.o.uh === 1 ) {

						v.obj_use_header.val( '1' );
					}

					if ( p.data.p.o.uh === 0 ) {

						v.obj_use_header.val( '0' );
					}

				// }

				// HEADER: SET HEADER VISIBILITY {

					if ( p.data.p.o.uh === 1 ) {

						p.obj_table.removeClass( 'acf-table-hide-header' );

					}

					if ( p.data.p.o.uh === 0 ) {

						p.obj_table.addClass( 'acf-table-hide-header' );
					}

				// }

			// }
		};

		t.table_add_col_event = function() {

			t.obj.body.on( 'click', '.acf-table-add-col', function( e ) {

				e.preventDefault();

				var that = $( this ),
					p = {};

				p.obj_col = that.parent();

				t.table_add_col( p );

			} );
		};

		t.table_add_col = function( p ) {

				// requires
				// p.obj_col

				var that_index = p.obj_col.index();

				p.obj_root = p.obj_col.parents( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );

				$( p.obj_table.find( '.acf-table-top-row' ).children()[ that_index ] ).after( t.param.htmltable.top_cell.replace( '<!--ph-->', '' ) );

				$( p.obj_table.find( '.acf-table-header-row' ).children()[ that_index ] ).after( t.param.htmltable.header_cell.replace( '<!--ph-->', '' ) );

				p.obj_table.find( '.acf-table-body-row' ).each( function() {

					$( $( this ).children()[ that_index ] ).after( t.param.htmltable.body_cell.replace( '<!--ph-->', '' ) );
				} );

				$( p.obj_table.find( '.acf-table-bottom-row' ).children()[ that_index ] ).after( t.param.htmltable.bottom_cell.replace( '<!--ph-->', '' ) );

				t.table_top_labels( p );

				p.obj_table.find( '.acf-table-remove-col' ).show();
				p.obj_table.find( '.acf-table-remove-row' ).show();

				t.table_build_json( p );
		};

		t.table_remove_col = function() {

			t.obj.body.on( 'click', '.acf-table-remove-col', function( e ) {

				e.preventDefault();

				var p = {},
					that = $( this ),
					that_index = that.parent().index(),
					obj_rows = undefined,
					cols_count = false;

				p.obj_root = that.parents( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				p.obj_top = p.obj_root.find( '.acf-table-top-row' );
				obj_rows = p.obj_table.find( '.acf-table-body-row' );
				cols_count = p.obj_top.find( '.acf-table-top-cell' ).length;

				$( p.obj_table.find( '.acf-table-top-row' ).children()[ that_index ] ).remove();

				$( p.obj_table.find( '.acf-table-header-row' ).children()[ that_index ] ).remove();

				if ( cols_count == 1 ) {

					obj_rows.remove();

					t.table_add_col( {
						obj_col: p.obj_table.find( '.acf-table-top-left' )
					} );

					t.table_add_row( {
						obj_row: p.obj_table.find( '.acf-table-header-row' )
					} );

					p.obj_table.find( '.acf-table-remove-col' ).hide();
					p.obj_table.find( '.acf-table-remove-row' ).hide();
				}
				else {

					obj_rows.each( function() {

						$( $( this ).children()[ that_index ] ).remove();
					} );
				}

				$( p.obj_table.find( '.acf-table-bottom-row' ).children()[ that_index ] ).remove();

				t.table_top_labels( p );

				t.table_build_json( p );

			} );
		};

		t.table_add_row_event = function() {

			t.obj.body.on( 'click', '.acf-table-add-row', function( e ) {

				e.preventDefault();

				var that = $( this ),
					p = {};

				p.obj_row = that.parent().parent();

				t.table_add_row( p );
			});
		};

		t.table_add_row = function( p ) {

			// requires
			// p.obj_row

			var that_index = 0,
				col_amount = 0,
				body_cells_html = '';

			p.obj_root = p.obj_row.parents( '.acf-table-root' );
			p.obj_table = p.obj_root.find( '.acf-table-table' );
			p.obj_table_rows = p.obj_table.children();
			col_amount = p.obj_table.find( '.acf-table-top-cell' ).size();
			that_index = p.obj_row.index();

			for ( i = 0; i < col_amount; i++ ) {

				body_cells_html = body_cells_html + t.param.htmltable.body_cell.replace( '<!--ph-->', '' );
			}

			$( p.obj_table_rows[ that_index ] )
				.after( t.param.htmltable.body_row )
				.next()
				.find('.acf-table-body-left')
				.after( body_cells_html );

			t.table_left_labels( p );

			p.obj_table.find( '.acf-table-remove-col' ).show();
			p.obj_table.find( '.acf-table-remove-row' ).show();

			t.table_build_json( p );

		};

		t.table_remove_row = function() {

			t.obj.body.on( 'click', '.acf-table-remove-row', function( e ) {

				e.preventDefault();

				var p = {},
					that = $( this ),
					rows_count = false;

				p.obj_root = that.parents( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );
				p.obj_rows = p.obj_root.find( '.acf-table-body-row' );

				rows_count = p.obj_rows.length;

				that.parent().parent().remove();

				if ( rows_count == 1 ) {

					t.table_add_row( {
						obj_row: p.obj_table.find( '.acf-table-header-row' )
					} );

					p.obj_table.find( '.acf-table-remove-row' ).hide();
				}

				t.table_left_labels( p );

				t.table_build_json( p );

			} );
		};

		t.table_top_labels = function( p ) {

			var letter_i_1 = 'A'.charCodeAt( 0 ),
				letter_i_2 = 'A'.charCodeAt( 0 ),
				use_2 = false;

			p.obj_table.find( '.acf-table-top-cont' ).each( function() {

				var string = '';

				if ( !use_2 ) {

					string = String.fromCharCode( letter_i_1 );

					if ( letter_i_1 === 'Z'.charCodeAt( 0 ) ) {

						letter_i_1 = 'A'.charCodeAt( 0 );
						use_2 = true;
					}
					else {

						letter_i_1 = letter_i_1 + 1;
					}
				}
				else {

					string = String.fromCharCode( letter_i_1 ) + String.fromCharCode( letter_i_2 );

					if ( letter_i_2  === 'Z'.charCodeAt( 0 ) ) {

						letter_i_1 = letter_i_1 + 1;
						letter_i_2 = 'A'.charCodeAt( 0 );
					}
					else {

						letter_i_2 = letter_i_2 + 1;
					}
				}

				$( this ).text( string );

			} );
		};

		t.table_left_labels = function( p ) {

			var i = 0;

			p.obj_table.find( '.acf-table-body-left' ).each( function() {

				i = i + 1;

				$( this ).find( '.acf-table-body-cont' ).text( i );

			} );
		};

		t.table_build_json = function( p ) {

			var i = 0,
				i2 = 0;

			p.data = t.data_get( p );
			t.data_default( p );

			p.data.c = [];
			p.data.h = [];
			p.data.b = [];

			// TOP {

				i = 0;

				p.obj_table.find( '.acf-table-top-cont' ).each( function() {

					p.data.c[ i ] = {};
					p.data.c[ i ].p = $( this ).parent().data( 'colparam' );

					i = i + 1;
				} );

			// }

			// HEADER {

				i = 0;

				p.obj_table.find( '.acf-table-header-cont' ).each( function() {

					p.data.h[ i ] = {};
					p.data.h[ i ].c = $( this ).html();

					i = i + 1;
				} );

			// }

			// BODY {

				i = 0;
				i2 = 0;

				p.obj_table.find( '.acf-table-body-row' ).each( function() {

					p.data.b[ i ] = [];

					$( this ).find( '.acf-table-body-cell .acf-table-body-cont' ).each( function() {

						p.data.b[ i ][ i2 ] = {};
						p.data.b[ i ][ i2 ].c = $( this ).html();

						i2 = i2 + 1;
					} );

					i2 = 0;
					i = i + 1;
				} );

			// }

			// UPDATE INPUT WITH NEW DATA {

				t.update_table_data_field( p );

			// }
		};

		t.update_table_data_field = function( p ) {

			// UPDATE INPUT WITH NEW DATA {

				p.data = t.update_table_data_version( p.data );

				p.obj_root.find( 'input.table' ).val( encodeURIComponent( JSON.stringify( p.data ).replace( /\\"/g, '\\"' ) ) );

			// }
		};

		t.update_table_data_version = function( data ) {

			if ( typeof data.acftf === 'undefined' ) {

				data.acftf = {};
			}

			data.acftf.v = t.version;

			return data;
		}

		t.cell_editor = function() {

			t.obj.body.on( 'click', '.acf-table-body-cell, .acf-table-header-cell', function( e ) {

				e.stopImmediatePropagation();

				t.cell_editor_save();

				var that = $( this );

				t.cell_editor_add_editor({
					'that': that
				});

			} );

			t.obj.body.on( 'click', '.acf-table-cell-editor-textarea', function( e ) {

				e.stopImmediatePropagation();
			} );

			t.obj.body.on( 'click', function( e ) {

				t.cell_editor_save();
			} );
		};

		t.cell_editor_add_editor = function( p ) {

			var defaults = {
				'that': false
			};

			p = $.extend( true, defaults, p );

			if ( p['that'] ) {

				var that_val = p['that'].find( '.acf-table-body-cont, .acf-table-header-cont' ).html();

				t.state.current_cell_obj = p['that'];
				t.state.cell_editor_is_open = true;

				p['that'].prepend( t.param.htmleditor ).find( '.acf-table-cell-editor-textarea' ).html( that_val ).focus();
			}
		};

		t.get_next_table_cell = function( p ) {

			var defaults = {
				'key': false
			};

			p = $.extend( true, defaults, p );

			// next cell of current row
			var next_cell = t.state.current_cell_obj
								.next( '.acf-table-body-cell, .acf-table-header-cell' );

			// else if get next row
			if ( next_cell.length === 0 ) {

				next_cell = t.state.current_cell_obj
					.parent()
					.next( '.acf-table-body-row' )
					.find( '.acf-table-body-cell')
					.first();
			}

			// if next row, get first cell of that row
			if ( next_cell.length !== 0 ) {

				t.state.current_cell_obj = next_cell;
			}
			else {

				t.state.current_cell_obj = false;
			}
		};

		t.get_prev_table_cell = function( p ) {

			var defaults = {
				'key': false
			};

			p = $.extend( true, defaults, p );

			// prev cell of current row
			var table_obj = t.state.current_cell_obj.closest( '.acf-table-table' ),
				no_header = table_obj.hasClass( 'acf-table-hide-header' );
				prev_cell = t.state.current_cell_obj
								.prev( '.acf-table-body-cell, .acf-table-header-cell' );

			// else if get prev row
			if ( prev_cell.length === 0 ) {

				var row_selectors = [ '.acf-table-body-row' ];

				// prevents going to header cell if table header is hidden
				if ( no_header === false ) {

					row_selectors.push( '.acf-table-header-row' );
				}

				prev_cell = t.state.current_cell_obj
					.parent()
					.prev( row_selectors.join( ',' ) )
					.find( '.acf-table-body-cell, .acf-table-header-cell' )
					.last();
			}

			// if next row, get first cell of that row
			if ( prev_cell.length !== 0 ) {

				t.state.current_cell_obj = prev_cell;
			}
			else {

				t.state.current_cell_obj = false;
			}
		};

		t.cell_editor_save = function() {

			var cell_editor = t.obj.body.find( '.acf-table-cell-editor' ),
				cell_editor_textarea = cell_editor.find( '.acf-table-cell-editor-textarea' ),
				p = {},
				cell_editor_val = '';

			if ( typeof cell_editor_textarea.val() !== 'undefined' ) {

				p.obj_root = cell_editor.parents( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );

				var cell_editor_val = cell_editor_textarea.val();

				// prevent XSS injection
				cell_editor_val = cell_editor_val.replace( /\<(script)/ig, '&#060;$1' );
				cell_editor_val = cell_editor_val.replace( /\<\/(script)/ig, '&#060;/$1' );

				cell_editor.next().html( cell_editor_val );

				t.table_build_json( p );

				cell_editor.remove();
				t.state.cell_editor_is_open = false;

				p.obj_root.find( '.acf-table-remove-col' ).show(),
				p.obj_root.find( '.acf-table-remove-row' ).show();
			}
		};

		t.cell_editor_tab_navigation = function() {

			t.obj.body.on( 'keydown', '.acf-table-cell-editor', function( e ) {

				var keyCode = e.keyCode || e.which;

				if ( keyCode == 9 ) {

					e.preventDefault();

					t.cell_editor_save();

					if ( t.state.cell_editor_last_keycode === 16 ) {

						t.get_prev_table_cell();

					}
					else {

						t.get_next_table_cell();
					}

					t.cell_editor_add_editor({
						'that': t.state.current_cell_obj
					});
				}

				t.state.cell_editor_last_keycode = keyCode;

			});
		};

		t.prevent_cell_links = function() {

			t.obj.body.on( 'click', '.acf-table-body-cont a, .acf-table-header-cont a', function( e ) {

				e.preventDefault();
			} );
		};

		t.sortable_fix_width = function(e, ui) {

			ui.children().each( function() {

				var that = $( this );

				that.width( that.width() );

			} );

			return ui;
		};

		t.sortable_row = function() {

			var param = {
				axis: 'y',
				items: '> .acf-table-body-row',
				containment: 'parent',
				handle: '.acf-table-body-left',
				helper: t.sortable_fix_width,
				update: function( event, ui ) {

					var p = {};

					p.obj_root = ui.item.parents( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );

					t.table_left_labels( p );
					t.table_build_json( p );
				},
			};

			$( '.acf-table-table' ).sortable( param );

		};

		t.sortable_col = function() {

			var p = {};

			p.start_index = 0;
			p.end_index = 0;

			var param = {
				axis: 'x',
				items: '> .acf-table-top-cell',
				containment: 'parent',
				helper: t.sortable_fix_width,
				start: function(event, ui) {

					p.start_index = ui.item.index();
				},
				update: function( event, ui ) {

					p.end_index = ui.item.index();

					p.obj_root = ui.item.parents( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );

					t.table_top_labels( p );
					t.sort_cols( p );
					t.table_build_json( p );
				},
			};

			$( '.acf-table-top-row' ).sortable( param );

			t.obj.body.on( 'click', '.acf-fc-popup', function() {

				$( '.acf-table-top-row' )
					.sortable('destroy')
					.unbind();

				window.setTimeout( function() {

					$( '.acf-table-top-row' ).sortable( param );

				}, 300 );

			} );

		};

		t.sort_cols = function( p ) {

			p.obj_table.find('.acf-table-header-row').each( function() {

				p.header_row = $(this),
				p.header_row_children = p.header_row.children();

				if ( p.end_index < p.start_index ) {

					$( p.header_row_children[ p.end_index ] ).before( $( p.header_row_children[ p.start_index ] ) );
				}

				if ( p.end_index > p.start_index ) {

					$( p.header_row_children[ p.end_index ] ).after( $( p.header_row_children[ p.start_index ] ) );
				}

			} );

			p.obj_table.find('.acf-table-body-row').each( function() {

				p.body_row = $(this),
				p.body_row_children = p.body_row.children();

				if ( p.end_index < p.start_index ) {

					$( p.body_row_children[ p.end_index ] ).before( $( p.body_row_children[ p.start_index ] ) );
				}

				if ( p.end_index > p.start_index ) {

					$( p.body_row_children[ p.end_index ] ).after( $( p.body_row_children[ p.start_index ] ) );
				}

			} );
		};

		t.helper = {

			getLength: function( o ) {

				var len = o.length ? --o.length : -1;

				for (var k in o) {

					len++;
				}

				return len;
			},
		};
	};

	var acf_table_field = new ACFTableField();
	acf_table_field.init();

});
