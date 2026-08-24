var ACFTableField = {};

(function($) {

	function ACFTableFieldMain() {

		var t = this;

		t.version = '1.4.0';

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

		t.tables = {};

		t.state = {
			'current_cell_obj': false,
			'cell_editor_cell': false,
			'cell_editor_last_keycode': false
		};

		t.init = function() {

			t.init_once();
			t.update_tables();

			// DETECT NEW TABLES AFTER DOM CHANGES {

				var interval = false;

				let mutationObserver = new MutationObserver( function( mutations ) {

					clearInterval( interval );

					interval = setInterval( function() {

						if ( $( '.acf-table-root' ).not( '.acf-table-rendered' ).length > 0 ) {

							t.update_tables();
						}

						clearInterval( interval );

					}, 250 );

				});

				mutationObserver.observe( document.documentElement, {
					childList: true,
					subtree: true,
				});

			// }

		};

		t.update_tables = function() {

			t.each_table();
		};

		t.init_once = function() {

			t.table_remove_row();
			t.table_remove_col();
			t.table_add_col_event();
			t.table_add_row_event();
			t.sortable_event();
			t.cell_editor();
			t.cell_editor_tab_navigation();
			t.prevent_cell_links();
			//t.ui_event_ajax();
			t.ui_event_use_header();
			t.ui_event_caption();
			t.ui_event_change_location_rule();
		};

		t.ui_event_ajax = function() {

			$( document ).ajaxComplete( function( event ) {

				setTimeout( function() {

					t.each_table();

				}, 1 );
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

		t.get_field_key = function( that ) {

			// DETECT BLOCK, GETS BLOCK ID {

				var block_id = '';

				$wp_block = that.closest( '.wp-block' );

				if ( $wp_block.length > 0 ) {

					var block_id = $wp_block.attr( 'id' );
				}

			// }

			var target = that.closest( '[data-key^="field_"]' );

			if ( target.length > 0 ) {

				return block_id + ':' + target.data( 'key' );
			}

			return false;
		};

		t.each_table = function( ) {

			$( '.acf-field-table .acf-table-root' ).not( '.acf-table-rendered' ).each( function() {

				var p = {};

				p.obj_root = $( this );

				var that = $( this ),
					field_key = t.get_field_key( that ),
					table = p.obj_root.find( '.acf-table-wrap' );

				// ADDS TABLE OBJECT {

					t.tables[ field_key ] = p;

				// }

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

				p.field_options = JSON.parse( decodeURIComponent( p.obj_root.find( '[data-field-options]' ).data( 'field-options' ) ) );
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

					p.obj_root = that.closest( '.acf-table-root' );
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

		t.ui_event_caption = function() {

			// CAPTION: INPUT FIELD ACTIONS {

				t.obj.body.on( 'change', '.acf-table-fc-opt-caption', function() {

					var that = $( this );
					t.caption_update( that );
				} );

				var interval;

				t.obj.body.on( 'keyup', '.acf-table-fc-opt-caption', function() {

					clearInterval( interval );
					var that = $( this );

					interval = setInterval( function() {

						t.caption_update( that );
						clearInterval( interval );
					}, 300 );

				} );

			// }
		};

		t.caption_update = function( that ) {

			p = {};

			p.obj_root = that.closest( '.acf-table-root' );
			p.obj_table = p.obj_root.find( '.acf-table-table' );

			t.data_get( p );
			t.data_default( p );

			p.data.p.ca = t.sanitizeHtml( that.val() );
			t.update_table_data_field( p );
		};

		t.data_get = function( p ) {

			// DATA FROM FIELD {

				var val = p.obj_root.find( 'input.table' ).val();

				p.data = false;

				// CHECK FIELD CONTEXT {

					if ( p.obj_root.closest( '.acf-fields' ).hasClass( 'acf-block-fields' ) ) {

						p.field_context = 'block';
					}
					else {

						p.field_context = 'box';
					}

				// }

				if ( val !== '' ) {

					try {

						if ( p.field_context === 'box' ) {

							p.data = JSON.parse( decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}

						if ( p.field_context === 'block' ) {

							p.data = JSON.parse( decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}
					}
					catch (e) {

						if ( p.field_context === 'box' ) {

							console.log( 'The parsing error:', e );
							console.log( 'The tablefield value is not a valid JSON string:', decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}

						if ( p.field_context === 'block' ) {

							console.log( 'The parsing error:', e );
							console.log( 'The tablefield value is not a valid JSON string:', decodeURIComponent( val.replace(/\+/g, '%20') ) );
						}
					}

					if ( typeof p.data.p != 'object' ) {

						console.log( 'The tablefield value is not a tablefield JSON string:', p.data );

						p.data = false;
					}
				}

				return p.data;

			// }

		};

		t.data_default = function( p ) {

			// DEFINES DEFAULT TABLE DATA {

				p.data_defaults = {

					acftf: {
						v: t.version,
					},

					p: {
						o: {
							uh: 0, // use header
						},
						ca: '', // caption content
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

			// ADDS MISSING DATA OR DATA SECTIONS FROM DEFAULT {

				if ( p.data ) {

					if ( typeof p.data.c !== 'object' ) {

						p.data.c = p.data_defaults.c;
					}

					if ( typeof p.data.h !== 'object' ) {

						p.data.b = p.data_defaults.h;
					}

					if ( typeof p.data.b !== 'object' ) {

						p.data.b = p.data_defaults.b;
					}

					if ( typeof p.data.p !== 'object' ) {

						p.data.p = p.data_defaults.p;
					}

					if ( typeof p.data.acftf !== 'object' ) {

						p.data.acftf === p.data_defaults.acftf;
					}

				}
				else {

					p.data = p.data_defaults;
				}

			// }

			// MERGES MISSING SECTION PARAMETERS FROM DEFAULTS {

				p.data.acftf = $.extend( true, p.data_defaults.acftf, p.data.acftf );
				p.data.p = $.extend( true, p.data_defaults.p, p.data.p );

			// }
		};

		t.table_render = function( p ) {

			let build_table_json = false;

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

			// CHECK FOR EQUAL COLUMNS IN COLUMNS DATA AND FIRST BODY ROW DATA {

				if (
					p.data.c &&
					p.data.b &&
					p.data.c.length < p.data.b[0].length
				 ) {

					build_table_json = true;

					let length =  p.data.b[0].length;

					for ( let index = 0; index < length; index++ ) {

						p.data.c[ index ] = { o: {} };
					}
				}

				let cols = p.data.c.length;

			// }

			// TOP CELLS {

				// INSERT TOP CELLS {

					if ( p.data.c ) {

						for ( i in p.data.c ) {

							p.obj_top_insert.before( t.param.htmltable.top_cell );
						}
					}

					t.table_top_labels( p );

				// }

			// }

			// HEADER CELLS {

				if ( p.data.h ) {

					for ( i in p.data.h ) {

						// PREVENTS TO MANY CELLS {

							if ( cols <= i ) {

								build_table_json = true;
								break;
							}

						// }

						p.data.h[ i ].c = t.sanitizeHtml( p.data.h[ i ].c );

						p.obj_header_insert.before( t.param.htmltable.header_cell.replace( '<!--ph-->', p.data.h[ i ].c ) );
					}

					// ADDS MISSING CELLS {

						let existing_cells = i + 1;

						if ( cols > existing_cells  ) {

							for ( let add_i = 0; add_i < (cols - existing_cells); add_i++ ) {

								p.obj_header_insert.before( t.param.htmltable.header_cell.replace( '<!--ph-->', '' ) );
							}

							build_table_json = true;
						}

					// }
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

							i = parseInt( i );

							// PREVENTS TO MANY CELLS {

								if ( cols <= i ) {

									build_table_json = true;
									break;
								}

							// }

							p.data.b[ row_i ][ i ].c = t.sanitizeHtml( p.data.b[ row_i ][ i ].c );

							row_insert.before( t.param.htmltable.body_cell.replace( '<!--ph-->', p.data.b[ row_i ][ i ].c ) );
						}

						// ADDS MISSING CELLS {

							let existing_cells = i + 1;

							if ( cols > existing_cells  ) {

								for ( let add_i = 0; add_i < (cols - existing_cells); add_i++ ) {

									row_insert.before( t.param.htmltable.body_cell.replace( '<!--ph-->', '' ) );
								}

								build_table_json = true;
							}

						// }

						row_i = row_i + 1;
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

			// BUILD TABLE JSON {

				if ( true === build_table_json ) {

					t.table_build_json( p );
				}

			// }

		};

		t.misc_render = function( p ) {

			t.init_option_use_header( p );
			t.init_option_caption( p );
		};

		t.init_option_use_header = function( p ) {

			// VARS {

				var v = {};

				v.obj_use_header = p.obj_root.find( '.acf-table-fc-opt-use-header' );

			// }

			// HEADER {

				// HEADER: FIELD OPTIONS, THAT AFFECTS DATA {

					// HEADER IS NOT ALLOWED

					if (
						p.field_options.use_header === 2 &&
						p.data.p.o.uh !== 0
					) {

						p.obj_table.addClass( 'acf-table-hide-header' );

						p.data.p.o.uh = 0;
						t.update_table_data_field( p );
					}

					// HEADER IS REQUIRED

					if (
						p.field_options.use_header === 1 &&
						p.data.p.o.uh !== 1
					) {

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

		t.init_option_caption = function( p ) {

			if (
				typeof p.field_options.use_caption !== 'number' ||
				p.field_options.use_caption === 2
			) {

				return;
			}

			// VARS {

				var v = {};

				v.obj_caption = p.obj_root.find( '.acf-table-fc-opt-caption' );

			// }

			// SET CAPTION VALUE {

				v.obj_caption.val( p.data.p.ca );

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

				p.obj_root = p.obj_col.closest( '.acf-table-root' );
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

				p.obj_root = that.closest( '.acf-table-root' );
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

			p.obj_root = p.obj_row.closest( '.acf-table-root' );
			p.obj_table = p.obj_root.find( '.acf-table-table' );
			p.obj_table_rows = p.obj_table.children();
			col_amount = p.obj_table.find( '.acf-table-top-cell' ).length;
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

				p.obj_root = that.closest( '.acf-table-root' );
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
				i2 = 0,
				rerender_table = false;

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

				let cols = p.data.c.length;

			// }

			// HEADER {

				i = 0;

				p.obj_table.find( '.acf-table-header-cont' ).each( function() {

					// PREVENTS TO MANY CELLS {

						if ( cols <= i ) {

							rerender_table = true;
							return;
						}

					// }

					p.data.h[ i ] = {};
					p.data.h[ i ].c = $( this ).html();

					i = i + 1;
				} );

				// ADDS MISSING CELLS {

					let existing_cells = i;

					if ( cols > existing_cells  ) {

						for ( let add_i = 0; add_i < (cols - existing_cells); add_i++ ) {

							let new_i = p.data.h.length;
							p.data.h[ new_i ] = {};
							p.data.h[ new_i ].c = '';
							rerender_table = true;
						}
					}

				// }

			// }

			// BODY {

				i = 0;
				i2 = 0;

				p.obj_table.find( '.acf-table-body-row' ).each( function() {

					p.data.b[ i ] = [];

					$( this ).find( '.acf-table-body-cell .acf-table-body-cont' ).each( function() {

						// PREVENTS TO MANY CELLS {

							if ( cols <= i2 ) {

								rerender_table = true;
								return;
							}

						// }

						p.data.b[ i ][ i2 ] = {};
						p.data.b[ i ][ i2 ].c = $( this ).html();

						i2 = i2 + 1;
					} );

					// ADDS MISSING CELLS {

						let existing_cells = i2;

						if ( cols > existing_cells  ) {

							for ( let add_i = 0; add_i < (cols - existing_cells); add_i++ ) {

								let new_i = p.data.b[ i ].length;
								p.data.b[ i ][ new_i ] = {};
								p.data.b[ i ][ new_i ].c = '';
								rerender_table = true;
							}
						}

					// }

					i2 = 0;
					i = i + 1;
				} );

			// }

			// UPDATE INPUT WITH NEW DATA {

				t.update_table_data_field( p );

			// }

			// RERENDER TABLE (DATA REPAIR OCCURED) {

				if ( true === rerender_table ) {

					t.table_render( p );
				}

			// }

		};

		t.update_table_data_field = function( p ) {

			// UPDATE INPUT WITH NEW DATA {

				p.data = t.update_table_data_version( p.data );

				// makes json string from data object
				var data = JSON.stringify( p.data );

				// adds backslash to all \" in JSON string because encodeURIComponent() strippes backslashes
				data.replace( /\\"/g, '\\"' );

				// encodes the JSON string to URI component, the format, the JSON string is saved to the database
				data = encodeURIComponent( data )

				p.obj_root.find( 'input.table' ).val( data );

				t.field_changed( p );

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

			t.cell_editor_update_event();
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

				that_val = t.sanitizeHtml( that_val );

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

		t.cell_editor_update_event = function() {

			var interval;

			t.obj.body.on( 'keyup', '.acf-table-cell-editor-textarea', function() {

				clearInterval( interval );

				interval = setInterval( function() {

					t.cell_editor_update();
					clearInterval( interval );
				}, 300 );
			} );

		};

		t.cell_editor_update = function() {

			var cell_editor = t.obj.body.find( '.acf-table-cell-editor' ),
				cell_editor_textarea = cell_editor.find( '.acf-table-cell-editor-textarea' ),
				p = {},
				cell_editor_val = '';

			if ( typeof cell_editor_textarea.val() !== 'undefined' ) {

				p.obj_root = cell_editor.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );

				var cell_editor_val = cell_editor_textarea.val();

				// prevent XSS injection
				cell_editor_val = t.sanitizeHtml( cell_editor_val );

				cell_editor.next().html( cell_editor_val );

				t.table_build_json( p );
			}
		};

		t.cell_editor_save = function() {

			var cell_editor = t.obj.body.find( '.acf-table-cell-editor' ),
				cell_editor_textarea = cell_editor.find( '.acf-table-cell-editor-textarea' ),
				p = {},
				cell_editor_val = '';

			if ( typeof cell_editor_textarea.val() !== 'undefined' ) {

				p.obj_root = cell_editor.closest( '.acf-table-root' );
				p.obj_table = p.obj_root.find( '.acf-table-table' );

				var cell_editor_val = cell_editor_textarea.val();

				// prevent XSS injection
				cell_editor_val = t.sanitizeHtml( cell_editor_val );

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

		t.sortable_row = function( that ) {

			var param = {
				axis: 'y',
				items: '> .acf-table-body-row',
				containment: 'parent',
				handle: '.acf-table-body-left',
				helper: t.sortable_fix_width,
				update: function( event, ui ) {

					var p = {};

					p.obj_root = ui.item.closest( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );

					t.table_left_labels( p );
					t.table_build_json( p );
				},
			};

			that.sortable( param );

		};

		t.sortable_col = function( that ) {

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

					p.obj_root = ui.item.closest( '.acf-table-root' );
					p.obj_table = p.obj_root.find( '.acf-table-table' );

					t.table_top_labels( p );
					t.sort_cols( p );
					t.table_build_json( p );
				},
			};

			that.find( '.acf-table-top-row' ).sortable( param );
		};

		t.sortable_event = function() {

			t.obj.body.on( 'mouseenter', '.acf-table-table:not(.sortable-initialized)', function() {

				var that = $( this );

				t.sortable_row( that );
				t.sortable_col( that );

				that.addClass( 'sortable-initialized' );

			} );

		};

		t.field_changed = function( p ) {

			setTimeout( function() {

				p.obj_root.trigger( 'change' );
			}, 0 );
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

		t.sanitizeHtml = function( string ) {

			let options = {
				USE_PROFILES: {
					html: true
				},
				ADD_ATTR: ['target'],
			};

			options = t.doFilter( 'core', 'sanitize_html', options );

			string = t.DOMPurify.sanitize( string, options );
			string = t.addNoopenerToHtmlString( string );

			return string;
		};

		t.addNoopenerToHtmlString = function (html) {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");

			doc.querySelectorAll('a[target="_blank"]').forEach(link => {
				const rel = link.getAttribute('rel');

				if (!rel) {
					link.setAttribute('rel', 'noopener');
				} else if (!rel.split(/\s+/).includes('noopener')) {
					link.setAttribute('rel', rel + ' noopener');
				}
			});

			return doc.body.innerHTML;
		}

		t.DOMPurify = (function () {

			/* This plugin uses its own embedded DOMPurify script to avoid
			conflicts with other DOMPurify integrations via wp_enqueue_script().
			This could result in an outdated version of DOMPurify being preferred. */

			return (function () {
				/*! @license DOMPurify 3.4.14 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.14/LICENSE */

				/* Copied substring without UMD-Wrapper from https://github.com/cure53/DOMPurify/blob/main/dist/purify.min.js */
				"use strict";function t(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=Array(e);n<e;n++)o[n]=t[n];return o}function e(e,n){return function(t){if(Array.isArray(t))return t}(e)||function(t,e){var n=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=n){var o,r,i,a,l=[],c=!0,s=!1;try{if(i=(n=n.call(t)).next,0===e);else for(;!(c=(o=i.call(n)).done)&&(l.push(o.value),l.length!==e);c=!0);}catch(t){s=!0,r=t}finally{try{if(!c&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(s)throw r}}return l}}(e,n)||function(e,n){if(e){if("string"==typeof e)return t(e,n);var o={}.toString.call(e).slice(8,-1);return"Object"===o&&e.constructor&&(o=e.constructor.name),"Map"===o||"Set"===o?Array.from(e):"Arguments"===o||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(o)?t(e,n):void 0}}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}const n=Object.entries,o=Object.setPrototypeOf,r=Object.isFrozen,i=Object.getPrototypeOf,a=Object.getOwnPropertyDescriptor;let l=Object.freeze,c=Object.seal,s=Object.create,u="undefined"!=typeof Reflect&&Reflect,f=u.apply,p=u.construct;l||(l=function(t){return t}),c||(c=function(t){return t}),f||(f=function(t,e){for(var n=arguments.length,o=new Array(n>2?n-2:0),r=2;r<n;r++)o[r-2]=arguments[r];return t.apply(e,o)}),p||(p=function(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),o=1;o<e;o++)n[o-1]=arguments[o];return new t(...n)});const m=L(Array.prototype.forEach),d=L(Array.prototype.lastIndexOf),h=L(Array.prototype.pop),y=L(Array.prototype.push),g=L(Array.prototype.splice),b=Array.isArray,S=L(String.prototype.toLowerCase),T=L(String.prototype.toString),A=L(String.prototype.match),E=L(String.prototype.replace),w=L(String.prototype.indexOf),v=L(String.prototype.trim),O=L(Number.prototype.toString),x=L(Boolean.prototype.toString),N="undefined"==typeof BigInt?null:L(BigInt.prototype.toString),_="undefined"==typeof Symbol?null:L(Symbol.prototype.toString),D=L(Object.prototype.hasOwnProperty),R=L(Object.prototype.toString),k=L(RegExp.prototype.test),C=(I=TypeError,function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return p(I,e)});var I;function L(t){return function(e){e instanceof RegExp&&(e.lastIndex=0);for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return f(t,e,o)}}function z(t,e){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:S;if(o&&o(t,null),!b(e))return t;let i=e.length;for(;i--;){let o=e[i];if("string"==typeof o){const t=n(o);t!==o&&(r(e)||(e[i]=t),o=t)}t[o]=!0}return t}function M(t){for(let e=0;e<t.length;e++){D(t,e)||(t[e]=null)}return t}function P(t){const o=s(null);for(const i of n(t)){var r=e(i,2);const n=r[0],a=r[1];D(t,n)&&(b(a)?o[n]=M(a):a&&"object"==typeof a&&a.constructor===Object?o[n]=P(a):o[n]=a)}return o}function U(t,e){for(;null!==t;){const n=a(t,e);if(n){if(n.get)return L(n.get);if("function"==typeof n.value)return L(n.value)}t=i(t)}return function(){return null}}const F=l(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),H=l(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),j=l(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),B=l(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),W=l(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),Y=l(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),G=l(["#text"]),q=l(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","command","commandfor","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns"]),$=l(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dominant-baseline","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","pointer-events","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-orientation","text-rendering","textlength","type","u1","u2","unicode","values","vector-effect","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),X=l(["accent","accentunder","align","bevelled","close","columnalign","columnlines","columnspacing","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lquote","lspace","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),K=l(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),V=c(/{{[\w\W]*|^[\w\W]*}}/g),Z=c(/<%[\w\W]*|^[\w\W]*%>/g),J=c(/\${[\w\W]*/g),Q=c(/^data-[\-\w.\u00B7-\uFFFF]+$/),tt=c(/^aria-[\-\w]+$/),et=c(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),nt=c(/^(?:\w+script|data):/i),ot=c(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),rt=c(/^html$/i),it=c(/^[a-z][.\w]*(-[.\w]+)+$/i),at=c(/<[/\w!]/g),lt=c(/<[/\w]/g),ct=c(/<\/no(script|embed|frames)/i),st=c(/\/>/i),ut=1,ft=3,pt=7,mt=8,dt=9,ht=11,yt=["style","script","xmp","iframe","noembed","noframes","plaintext","noscript"],gt=l(z({},yt)),bt=function(){const t={};return m(yt,e=>{t[e]=c(new RegExp("</"+e+"(?=[\\t\\n\\f\\r />])","i"))}),l(t)}(),St=function(){return"undefined"==typeof window?null:window},Tt=function(t,e,n,o){return D(t,e)&&b(t[e])?z(o.base?P(o.base):{},t[e],o.transform):n},At=function(t,e,n){const o=D(t,e)?t[e]:void 0;return o&&"object"==typeof o?P(o):n()};var Et=function t(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:St();const o=e=>t(e);if(o.version="3.4.14",o.removed=[],!e||!e.document||e.document.nodeType!==dt||!e.Element)return o.isSupported=!1,o;let r=e.document;const i=r,a=i.currentScript;e.DocumentFragment;const u=e.HTMLTemplateElement,f=e.Node,p=e.Element,I=e.NodeFilter,L=e.NamedNodeMap;void 0===L&&(e.NamedNodeMap||e.MozNamedAttrMap),e.HTMLFormElement;const M=e.DOMParser,yt=e.trustedTypes,Et=p.prototype,wt=U(Et,"cloneNode"),vt=U(Et,"remove"),Ot=U(Et,"nextSibling"),xt=U(Et,"childNodes"),Nt=U(Et,"parentNode"),_t=U(Et,"shadowRoot"),Dt=U(Et,"attributes"),Rt=f&&f.prototype?U(f.prototype,"nodeType"):null,kt=f&&f.prototype?U(f.prototype,"nodeName"):null,Ct=f&&f.prototype?U(f.prototype,"ownerDocument"):null,It=function(t){return Rt?Rt(t):t.nodeType},Lt=function(t){return kt?kt(t):t.nodeName};if("function"==typeof u){const t=r.createElement("template");t.content&&t.content.ownerDocument&&(r=t.content.ownerDocument)}let zt,Mt,Pt="",Ut=!1,Ft=0;const Ht=function(){if(Ft>0)throw C('A configured TRUSTED_TYPES_POLICY callback (createHTML or createScriptURL) must not call DOMPurify.sanitize, as that causes infinite recursion. Do not pass a policy whose callbacks wrap DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted Types" section of the README.')},jt=function(t){Ht(),Ft++;try{return zt.createHTML(t)}finally{Ft--}},Bt=function(){return Ut||(Mt=function(t,e){if("object"!=typeof t||"function"!=typeof t.createPolicy)return null;let n=null;const o="data-tt-policy-suffix";e&&e.hasAttribute(o)&&(n=e.getAttribute(o));const r="dompurify"+(n?"#"+n:"");try{return t.createPolicy(r,{createHTML:t=>t,createScriptURL:t=>t})}catch(t){return console.warn("TrustedTypes policy "+r+" could not be created."),null}}(yt,a),Ut=!0),Mt},Wt=r,Yt=Wt.implementation,Gt=Wt.createNodeIterator,qt=Wt.createDocumentFragment,$t=Wt.getElementsByTagName,Xt=i.importNode;let Kt={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};o.isSupported="function"==typeof n&&"function"==typeof Nt&&Yt&&void 0!==Yt.createHTMLDocument;const Vt=V,Zt=Z,Jt=J,Qt=Q,te=tt,ee=nt,ne=ot,oe=it;let re=et,ie=null;const ae=z({},[...F,...H,...j,...W,...G]);let le=null;const ce=z({},[...q,...$,...X,...K]);let se=Object.seal(s(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),ue=null,fe=null;const pe=Object.seal(s(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let me=!0,de=!0,he=!1,ye=!0,ge=!1,be=!0,Se=!1,Te=!1,Ae=null,Ee=null,we=!1,ve=!1,Oe=!1,xe=!1,Ne=!0,_e=!1;const De="user-content-";let Re=!0,ke=!1,Ce={},Ie=null;const Le=z({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","selectedcontent","style","svg","template","thead","title","video","xmp"]);let ze=null;const Me=z({},["audio","video","img","source","image","track"]);let Pe=null;const Ue=z({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Fe="http://www.w3.org/1998/Math/MathML",He="http://www.w3.org/2000/svg",je="http://www.w3.org/1999/xhtml";let Be=je,We=!1,Ye=null;const Ge=z({},[Fe,He,je],T),qe=l(["mi","mo","mn","ms","mtext"]);let $e=z({},qe);const Xe=l(["annotation-xml"]);let Ke=z({},Xe);const Ve=z({},["title","style","font","a","script"]);let Ze=null;const Je=["application/xhtml+xml","text/html"];let Qe=null,tn=null;const en=r.createElement("form"),nn=function(t){return t instanceof RegExp||t instanceof Function},on=function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(tn&&tn===t)return;t&&"object"==typeof t||(t={}),t=P(t),Ze=-1===Je.indexOf(t.PARSER_MEDIA_TYPE)?"text/html":t.PARSER_MEDIA_TYPE,Qe="application/xhtml+xml"===Ze?T:S,ie=Tt(t,"ALLOWED_TAGS",ae,{transform:Qe}),le=Tt(t,"ALLOWED_ATTR",ce,{transform:Qe}),Ye=Tt(t,"ALLOWED_NAMESPACES",Ge,{transform:T}),Pe=Tt(t,"ADD_URI_SAFE_ATTR",Ue,{transform:Qe,base:Ue}),ze=Tt(t,"ADD_DATA_URI_TAGS",Me,{transform:Qe,base:Me}),Ie=Tt(t,"FORBID_CONTENTS",Le,{transform:Qe}),ue=Tt(t,"FORBID_TAGS",P({}),{transform:Qe}),fe=Tt(t,"FORBID_ATTR",P({}),{transform:Qe}),Ce=!!D(t,"USE_PROFILES")&&(t.USE_PROFILES&&"object"==typeof t.USE_PROFILES?P(t.USE_PROFILES):t.USE_PROFILES),me=!1!==t.ALLOW_ARIA_ATTR,de=!1!==t.ALLOW_DATA_ATTR,he=t.ALLOW_UNKNOWN_PROTOCOLS||!1,ye=!1!==t.ALLOW_SELF_CLOSE_IN_ATTR,ge=t.SAFE_FOR_TEMPLATES||!1,be=!1!==t.SAFE_FOR_XML,Se=t.WHOLE_DOCUMENT||!1,ve=t.RETURN_DOM||!1,Oe=t.RETURN_DOM_FRAGMENT||!1,xe=t.RETURN_TRUSTED_TYPE||!1,we=t.FORCE_BODY||!1,Ne=!1!==t.SANITIZE_DOM,_e=t.SANITIZE_NAMED_PROPS||!1,Re=!1!==t.KEEP_CONTENT,ke=t.IN_PLACE||!1,re=function(t){try{return k(t,""),!0}catch(t){return!1}}(t.ALLOWED_URI_REGEXP)?t.ALLOWED_URI_REGEXP:et,Be="string"==typeof t.NAMESPACE?t.NAMESPACE:je,$e=At(t,"MATHML_TEXT_INTEGRATION_POINTS",()=>z({},qe)),Ke=At(t,"HTML_INTEGRATION_POINTS",()=>z({},Xe));const e=At(t,"CUSTOM_ELEMENT_HANDLING",()=>s(null));if(se=s(null),D(e,"tagNameCheck")&&nn(e.tagNameCheck)&&(se.tagNameCheck=e.tagNameCheck),D(e,"attributeNameCheck")&&nn(e.attributeNameCheck)&&(se.attributeNameCheck=e.attributeNameCheck),D(e,"allowCustomizedBuiltInElements")&&"boolean"==typeof e.allowCustomizedBuiltInElements&&(se.allowCustomizedBuiltInElements=e.allowCustomizedBuiltInElements),c(se),ge&&(de=!1),Oe&&(ve=!0),Ce&&(ie=z({},G),le=s(null),!0===Ce.html&&(z(ie,F),z(le,q)),!0===Ce.svg&&(z(ie,H),z(le,$),z(le,K)),!0===Ce.svgFilters&&(z(ie,j),z(le,$),z(le,K)),!0===Ce.mathMl&&(z(ie,W),z(le,X),z(le,K))),pe.tagCheck=null,pe.attributeCheck=null,D(t,"ADD_TAGS")&&("function"==typeof t.ADD_TAGS?pe.tagCheck=t.ADD_TAGS:b(t.ADD_TAGS)&&(ie===ae&&(ie=P(ie)),z(ie,t.ADD_TAGS,Qe))),D(t,"ADD_ATTR")&&("function"==typeof t.ADD_ATTR?pe.attributeCheck=t.ADD_ATTR:b(t.ADD_ATTR)&&(le===ce&&(le=P(le)),z(le,t.ADD_ATTR,Qe))),D(t,"ADD_FORBID_CONTENTS")&&b(t.ADD_FORBID_CONTENTS)&&(Ie===Le&&(Ie=P(Ie)),z(Ie,t.ADD_FORBID_CONTENTS,Qe)),Re&&(ie["#text"]=!0),Se&&z(ie,["html","head","body"]),ie.table&&(z(ie,["tbody"]),delete ue.tbody),t.TRUSTED_TYPES_POLICY){if("function"!=typeof t.TRUSTED_TYPES_POLICY.createHTML)throw C('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof t.TRUSTED_TYPES_POLICY.createScriptURL)throw C('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');const e=zt;zt=t.TRUSTED_TYPES_POLICY;try{Pt=jt("")}catch(t){throw zt=e,t}}else null===t.TRUSTED_TYPES_POLICY?(zt=void 0,Pt=""):(void 0===zt&&(zt=Bt()),zt&&"string"==typeof Pt&&(Pt=jt("")));l&&l(t),tn=t},rn=z({},[...H,...j,...B]),an=z({},[...W,...Y]),ln=function(t){let e=Nt(t);e&&e.tagName||(e={namespaceURI:Be,tagName:"template"});const n=S(t.tagName),o=S(e.tagName);return!!Ye[t.namespaceURI]&&(t.namespaceURI===He?function(t,e,n){return e.namespaceURI===je?"svg"===t:e.namespaceURI===Fe?"svg"===t&&("annotation-xml"===n||$e[n]):Boolean(rn[t])}(n,e,o):t.namespaceURI===Fe?function(t,e,n){return e.namespaceURI===je?"math"===t:e.namespaceURI===He?"math"===t&&Ke[n]:Boolean(an[t])}(n,e,o):t.namespaceURI===je?function(t,e,n){return!(e.namespaceURI===He&&!Ke[n])&&!(e.namespaceURI===Fe&&!$e[n])&&!an[t]&&(Ve[t]||!rn[t])}(n,e,o):!("application/xhtml+xml"!==Ze||!Ye[t.namespaceURI]))},cn=function(t){y(o.removed,{element:t});try{Nt(t).removeChild(t)}catch(e){if(vt(t),!Nt(t))throw C("a node selected for removal could not be detached from its tree and cannot be safely returned; refusing to sanitize in place")}},sn=function(t,e,n){try{t.removeAttributeNode(e)}catch(e){try{t.removeAttribute(n)}catch(t){}}},un=function(t){mn(t);const e=xt(t);if(e){const t=[];m(e,e=>{y(t,e)}),m(t,t=>{try{vt(t)}catch(t){}})}const n=Dt(t);if(n)for(let e=n.length-1;e>=0;--e){const o=n[e],r=o&&o.name;"string"==typeof r&&sn(t,o,r)}},fn=function(t,e,n){if(!n)try{n=e.getAttributeNode(t)}catch(t){n=null}y(o.removed,{attribute:n||null,from:e});try{n?e.removeAttributeNode(n):e.removeAttribute(t)}catch(n){try{e.removeAttribute(t)}catch(t){}}if("is"===t)if(ve||Oe)try{cn(e)}catch(t){}else try{e.setAttribute(t,"")}catch(t){}},pn=function(t){const e=Dt(t);if(e)for(let n=e.length-1;n>=0;--n){const o=e[n],r=o&&o.name;"string"!=typeof r||le[Qe(r)]||sn(t,o,r)}},mn=function(t){const e=[t];for(;e.length>0;){const t=e.pop();It(t)===ut&&pn(t);const n=xt(t);if(n)for(let t=n.length-1;t>=0;--t)e.push(n[t])}},dn=function(t,e){return!!be&&("patchsrc"===t||"for"===t&&"label"!==e&&"output"!==e)},hn=function(t){let e=null,n=null;if(we)t="<remove></remove>"+t;else{const e=A(t,/^[\r\n\t ]+/);n=e&&e[0]}"application/xhtml+xml"===Ze&&Be===je&&(t='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+t+"</body></html>");const o=zt?jt(t):t;if(Be===je)try{e=(new M).parseFromString(o,Ze)}catch(t){}if(!e||!e.documentElement){e=Yt.createDocument(Be,"template",null);try{e.documentElement.innerHTML=We?Pt:o}catch(t){}}const i=e.body||e.documentElement;return t&&n&&i.insertBefore(r.createTextNode(n),i.childNodes[0]||null),Be===je?$t.call(e,Se?"html":"body")[0]:Se?e.documentElement:i},yn=function(t){const e=Ct?Ct(t):t.ownerDocument;return Gt.call(e||t,t,I.SHOW_ELEMENT|I.SHOW_COMMENT|I.SHOW_TEXT|I.SHOW_PROCESSING_INSTRUCTION|I.SHOW_CDATA_SECTION,null)},gn=function(t){return t=E(t,Vt," "),t=E(t,Zt," "),t=E(t,Jt," ")},bn=function(t){var e;t.normalize();const n=Ct?Ct(t):t.ownerDocument,o=Gt.call(n||t,t,I.SHOW_TEXT|I.SHOW_COMMENT|I.SHOW_CDATA_SECTION|I.SHOW_PROCESSING_INSTRUCTION,null);let r=o.nextNode();for(;r;)r.data=gn(r.data),r=o.nextNode();const i=null===(e=t.querySelectorAll)||void 0===e?void 0:e.call(t,"template");i&&m(i,t=>{Tn(t.content)&&bn(t.content)})},Sn=function(t){const e=kt?kt(t):null;return"string"==typeof e&&("form"===Qe(e)&&("string"!=typeof t.nodeName||"string"!=typeof t.textContent||"function"!=typeof t.removeChild||t.attributes!==Dt(t)||"function"!=typeof t.removeAttribute||"function"!=typeof t.setAttribute||"string"!=typeof t.namespaceURI||"function"!=typeof t.insertBefore||"function"!=typeof t.hasChildNodes||t.nodeType!==Rt(t)||t.childNodes!==xt(t)))},Tn=function(t){if(!Rt||"object"!=typeof t||null===t)return!1;try{return Rt(t)===ht}catch(t){return!1}},An=function(t){if(!Rt||"object"!=typeof t||null===t)return!1;try{return"number"==typeof Rt(t)}catch(t){return!1}};function En(t,e,n){0!==t.length&&m(t,t=>{t.call(o,e,n,tn)})}const wn=function(t,e){if(t instanceof RegExp)return k(t,e);if(t instanceof Function){for(var n=arguments.length,o=new Array(n>2?n-2:0),r=2;r<n;r++)o[r-2]=arguments[r];return Boolean(t(e,...o))}return!1},vn=function(t,e,n,o){return 0===t.length?e:e===n||e===o?P(e):e},On=function(t,e){return t!==e&&null===Nt(t)&&(ke&&mn(t),!0)},xn=function(t,e){if(En(Kt.beforeSanitizeElements,t,null),On(t,e))return!0;if(Sn(t))return cn(t),!0;const n=Qe(Lt(t));if(ie=vn(Kt.uponSanitizeElement,ie,ae,Ae),En(Kt.uponSanitizeElement,t,{tagName:n,allowedTags:ie}),On(t,e))return!0;if(function(t,e){return!!(be&&t.hasChildNodes()&&!An(t.firstElementChild)&&k(at,t.textContent)&&k(at,t.innerHTML))||!!(be&&t.namespaceURI===je&&gt[e]&&(An(t.firstElementChild)||"string"==typeof t.textContent&&k(bt[e],t.textContent)))||t.nodeType===pt||!(!be||t.nodeType!==mt||!k(lt,t.data))}(t,n))return cn(t),!0;if(ue[n]||!(pe.tagCheck instanceof Function&&pe.tagCheck(n))&&!ie[n]){const o=function(t,e,n){if(!ue[e]&&Dn(e)&&wn(se.tagNameCheck,e))return!1;if(Re&&!Ie[e]){const e=Nt(t),o=xt(t);if(o&&e)for(let r=o.length-1;r>=0;--r){const i=t===n?wt(o[r],!0):o[r];e.insertBefore(i,Ot(t))}}return cn(t),!0}(t,n,e);return!1===o&&En(Kt.afterSanitizeElements,t,null),o}if(It(t)===ut&&!ln(t))return cn(t),!0;if(("noscript"===n||"noembed"===n||"noframes"===n)&&k(ct,t.innerHTML))return cn(t),!0;if(ge&&t.nodeType===ft){const e=gn(t.textContent);t.textContent!==e&&(y(o.removed,{element:t.cloneNode()}),t.textContent=e)}return En(Kt.afterSanitizeElements,t,null),!1},Nn=function(t,e,n){if(fe[e])return!1;if(dn(e,t))return!1;if(Ne&&("id"===e||"name"===e)&&(n in r||n in en))return!1;const o=le[e]||pe.attributeCheck instanceof Function&&pe.attributeCheck(e,t);return!(!de||!k(Qt,e))||(!(!me||!k(te,e))||(o?!!Pe[e]||(!!k(re,E(n,ne,""))||(!("src"!==e&&"xlink:href"!==e&&"href"!==e||"script"===t||0!==w(n,"data:")||!ze[t])||(!(!he||k(ee,E(n,ne,"")))||!n))):Dn(t)&&wn(se.tagNameCheck,t)&&wn(se.attributeNameCheck,e,t)||"is"===e&&se.allowCustomizedBuiltInElements&&wn(se.tagNameCheck,n)))},_n=z({},["annotation-xml","color-profile","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","missing-glyph"]),Dn=function(t){return!_n[S(t)]&&k(oe,t)},Rn=function(t,e,n,o){if(zt&&"object"==typeof yt&&"function"==typeof yt.getAttributeType&&!n)switch(yt.getAttributeType(t,e)){case"TrustedHTML":return jt(o);case"TrustedScriptURL":return function(t){Ht(),Ft++;try{return zt.createScriptURL(t)}finally{Ft--}}(o)}return o},kn=function(t,e,n,r){try{n?t.setAttributeNS(n,e,r):t.setAttribute(e,r),Sn(t)?cn(t):h(o.removed)}catch(n){fn(e,t)}},Cn=function(t){En(Kt.beforeSanitizeAttributes,t,null);const e=t.attributes;if(!e||Sn(t))return;le=vn(Kt.uponSanitizeAttribute,le,ce,Ee);const n={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:le,forceKeepAttr:void 0};let o=e.length;const r=Qe(t.nodeName);for(;o--;){const i=e[o],a=i.name,l=i.namespaceURI,c=i.value,s=Qe(a),u=c;let f="value"===a?u:v(u);n.attrName=s,n.attrValue=f,n.keepAttr=!0,n.forceKeepAttr=void 0,En(Kt.uponSanitizeAttribute,t,n),f=n.attrValue,!_e||"id"!==s&&"name"!==s||0===w(f,De)||(fn(a,t,i),f=De+f),be&&k(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,f)?fn(a,t,i):"attributename"===s&&A(f,"href")?fn(a,t,i):n.forceKeepAttr||(n.keepAttr&&(ye||!k(st,f))?(ge&&(f=gn(f)),Nn(r,s,f)?(f=Rn(r,s,l,f),f!==u&&kn(t,a,l,f)):fn(a,t,i)):fn(a,t,i))}En(Kt.afterSanitizeAttributes,t,null)},In=function(t){let e=null;const n=yn(t);for(En(Kt.beforeSanitizeShadowDOM,t,null);e=n.nextNode();)if(En(Kt.uponSanitizeShadowNode,e,null),xn(e,t),Cn(e),Tn(e.content)&&In(e.content),It(e)===ut){const t=_t(e);Tn(t)&&(Ln(t),In(t))}En(Kt.afterSanitizeShadowDOM,t,null)},Ln=function(t){const e=[{node:t,shadow:null}];for(;e.length>0;){const t=e.pop();if(t.shadow){In(t.shadow);continue}const n=t.node,o=It(n)===ut,r=xt(n);if(r)for(let t=r.length-1;t>=0;--t)e.push({node:r[t],shadow:null});if(o){const t=kt?kt(n):null;if("string"==typeof t&&"template"===Qe(t)){const t=n.content;Tn(t)&&e.push({node:t,shadow:null})}}if(o){const t=_t(n);Tn(t)&&e.push({node:null,shadow:t},{node:t,shadow:null})}}};return o.sanitize=function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=null,r=null,a=null,l=null;if(We=!t,We&&(t="\x3c!--\x3e"),"string"!=typeof t&&!An(t)&&"string"!=typeof(t=function(t){switch(typeof t){case"string":return t;case"number":return O(t);case"boolean":return x(t);case"bigint":return N?N(t):"0";case"symbol":return _?_(t):"Symbol()";case"undefined":default:return R(t);case"function":case"object":{if(null===t)return R(t);const e=t,n=U(e,"toString");if("function"==typeof n){const t=n(e);return"string"==typeof t?t:R(t)}return R(t)}}}(t)))throw C("dirty is not a string, aborting");if(!o.isSupported)return t;Te?(ie=Ae,le=Ee):on(e),(Kt.uponSanitizeElement.length>0||Kt.uponSanitizeAttribute.length>0)&&(ie=P(ie)),Kt.uponSanitizeAttribute.length>0&&(le=P(le)),o.removed=[];const c=ke&&"string"!=typeof t&&An(t);if(c){!function(t){if(!be)return;const e=[t];for(;e.length>0;){const t=e.pop(),n=It(t);if(n===pt||n===mt&&k(lt,t.data)){try{vt(t)}catch(t){}continue}if(n===ut){const e=t,n=Qe(Lt(t));try{e.hasAttribute&&e.hasAttribute("patchsrc")&&e.removeAttribute("patchsrc"),e.hasAttribute&&e.hasAttribute("for")&&dn("for",n)&&e.removeAttribute("for")}catch(t){}}const o=xt(t);if(o)for(let t=o.length-1;t>=0;--t)e.push(o[t])}}(t);const e=Lt(t);if("string"==typeof e){const n=Qe(e);if(!ie[n]||ue[n])throw un(t),C("root node is forbidden and cannot be sanitized in-place")}if(Sn(t))throw un(t),C("root node is clobbered and cannot be sanitized in-place");try{Ln(t)}catch(e){throw un(t),e}}else if(An(t))n=hn("\x3c!----\x3e"),r=n.ownerDocument.importNode(t,!0),r.nodeType===ut&&"BODY"===r.nodeName||"HTML"===r.nodeName?n=r:n.appendChild(r),Ln(r);else{if(!ve&&!ge&&!Se&&-1===t.indexOf("<"))return zt&&xe?jt(t):t;if(n=hn(t),!n)return ve?null:xe?Pt:""}n&&we&&cn(n.firstChild);const s=c?t:n;try{const t=yn(s);for(;a=t.nextNode();)xn(a,s),Cn(a),Tn(a.content)&&In(a.content)}catch(e){throw c&&(un(t),m(o.removed,t=>{t.element&&mn(t.element)})),e}if(c)return m(o.removed,t=>{t.element&&mn(t.element)}),ge&&bn(t),t;if(ve){if(ge&&bn(n),Oe)for(l=qt.call(n.ownerDocument);n.firstChild;)l.appendChild(n.firstChild);else l=n;return(le.shadowroot||le.shadowrootmode)&&(l=Xt.call(i,l,!0)),l}let u=Se?n.outerHTML:n.innerHTML;return Se&&ie["!doctype"]&&n.ownerDocument&&n.ownerDocument.doctype&&n.ownerDocument.doctype.name&&k(rt,n.ownerDocument.doctype.name)&&(u="<!DOCTYPE "+n.ownerDocument.doctype.name+">\n"+u),ge&&(u=gn(u)),zt&&xe?jt(u):u},o.setConfig=function(){on(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),Te=!0,Ae=ie,Ee=le},o.clearConfig=function(){tn=null,Te=!1,Ae=null,Ee=null,zt=Mt,Pt=""},o.isValidAttribute=function(t,e,n){tn||on({});const o=Qe(t),r=Qe(e);return Nn(o,r,n)},o.addHook=function(t,e){"function"==typeof e&&D(Kt,t)&&y(Kt[t],e)},o.removeHook=function(t,e){if(D(Kt,t)){if(void 0!==e){const n=d(Kt[t],e);return-1===n?void 0:g(Kt[t],n,1)[0]}return h(Kt[t])}},o.removeHooks=function(t){D(Kt,t)&&(Kt[t]=[])},o.removeAllHooks=function(){Kt={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},o}();return Et;
			})();
		})();

		// ACTIONS {

			t.actions = {};

			t.doAction = function( part, action, param = 'undefined' ) {

				// t.doAction( 'part', 'action', param );
				// exit if there is no action
				if (
					typeof t.actions[ part ] == 'undefined'
					|| typeof t.actions[ part ][ action ] == 'undefined'
				) {

					//console.log( 'The action "' + action + '" does not exist in "t.' + part + '".' );
					return;
				}

				/* Defines action return object

					Data structure:
					ret{
						key: [ value1, value2 ]
					}

					The values are the different addAction() returns to the same key.
				*/
				let ret = {};

				// loop through and fire actions
				for ( var prioIndex in t.actions[ part ][ action ] ) {

					for ( var action_index in t.actions[ part ][ action ][ prioIndex ] ) {

						let tempRet = t.actions[ part ][ action ][ prioIndex ][ action_index ]( param );

						// Add action return {

							if ( typeof tempRet === 'object' ) {

								for ( let key in tempRet ) {

									if ( tempRet.hasOwnProperty(key) ) {

										if ( typeof ret[key] !== 'object' ) {

											ret[key] = [];
										}

										ret[key].push( tempRet[key] );
									}
								}
							}

						// }
					}
				}

				return ret;
			};

			t.addAction = function( part, action, callback, prio ) {

				if ( typeof prio === 'undefined' ) {

					prio = 10;
				}

				// t.addAction( 'part', 'action', t.callback, prio );

				// if there is no action object, define it
				if ( typeof t.actions[ part ] == 'undefined' ) {

					t.actions[ part ] = {};
				}

				// if there is no action, define it
				if ( typeof t.actions[ part ][ action ] == 'undefined' ) {

					t.actions[ part ][ action ] = {};
				}

				// if there is no action, define it
				if ( typeof t.actions[ part ][ action ][ prio ] == 'undefined' ) {

					t.actions[ part ][ action ][ prio ] = [];
				}

				// push new action to the action array
				t.actions[ part ][ action ][ prio ].push( callback );

			};

		// }

		// FILTERS {

			t.filters = {};

			t.doFilter = function( part, filter, value, param = {} ) {

				param.filter = {
					part: part,
					filter: filter
				};

				// t..doFilter( 'part', 'filter', value );
				// exit if there is no filter
				if (
					typeof t.filters[ part ] == 'undefined'
					|| typeof t.filters[ part ][ filter ] == 'undefined'
				) {

					//console.log( 'The filter "' + filter + '" does not exist in "t.' + part + '".' );
					return value;
				}

				// sort
				t.filters[ part ][ filter ].sort();

				// loop through and fire filter
				for ( var filterIndex in t.filters[ part ][ filter ] ) {

					for ( var prioIndex in t.filters[ part ][ filter ][ filterIndex ] ) {

						value = t.filters[ part ][ filter ][ filterIndex ][ prioIndex ]( value, param );

						// APPLY FILTER ONCE {

							if (
								typeof value === 'object' &&
								value !== null &&
								typeof value.applyOnce === 'boolean' &&
								value.applyOnce === true
							) {

								delete t.filters[ part ][ filter ][ filterIndex ][ prioIndex ];

								value = value.value;
							}

						// }
					}
				}

				return value;
			};

			t.addFilter = function( part, filter, callback, prio ) {

				if ( typeof prio === 'undefined' ) {

					prio = 10;
				}

				// t.addFilter( 'part', 'filter', t.callback );

				// if there is no filter object, define it
				if ( typeof t.filters[ part ] == 'undefined' ) {

					t.filters[ part ] = {};
				}

				// if there is no filter, define it
				if ( typeof t.filters[ part ][ filter ] == 'undefined' ) {

					t.filters[ part ][ filter ] = [];
				}

				// if there is no priority, define it
				if ( typeof t.filters[ part ][ filter ][ prio ] == 'undefined' ) {

					t.filters[ part ][ filter ][ prio ] = [];
				}

				// push new filter to the filter array
				t.filters[ part ][ filter ][ prio ].push( callback );

			};

		// }
	};

	ACFTableField = new ACFTableFieldMain();
	document.dispatchEvent(new CustomEvent('tableFieldRegisterHooks'));

})( jQuery );
