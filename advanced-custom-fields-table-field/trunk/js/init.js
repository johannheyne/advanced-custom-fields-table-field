var ACFTableField = {};

(function($) {

	function ACFTableFieldMain() {

		var t = this;

		t.version = '1.3.35';

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

						p.obj_header_insert.before( t.param.htmltable.header_cell.replace( '<!--ph-->', p.data.h[ i ].c.replace( /xxx&quot/g, '"' ) ) );
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

							row_insert.before( t.param.htmltable.body_cell.replace( '<!--ph-->', p.data.b[ row_i ][ i ].c.replace( /xxx&quot/g, '"' ) ) );
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
				ADD_ATTR: ['target']
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
				/*! @license DOMPurify 3.3.3 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.3/LICENSE */

				/* Copied substring without UMD-Wrapper from https://github.com/cure53/DOMPurify/blob/main/dist/purify.min.js */
				"use strict";const{entries:e,setPrototypeOf:t,isFrozen:n,getPrototypeOf:o,getOwnPropertyDescriptor:r}=Object;let{freeze:i,seal:a,create:l}=Object,{apply:c,construct:s}="undefined"!=typeof Reflect&&Reflect;i||(i=function(e){return e}),a||(a=function(e){return e}),c||(c=function(e,t){for(var n=arguments.length,o=new Array(n>2?n-2:0),r=2;r<n;r++)o[r-2]=arguments[r];return e.apply(t,o)}),s||(s=function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++)n[o-1]=arguments[o];return new e(...n)});const u=D(Array.prototype.forEach),m=D(Array.prototype.lastIndexOf),p=D(Array.prototype.pop),f=D(Array.prototype.push),d=D(Array.prototype.splice),h=D(String.prototype.toLowerCase),g=D(String.prototype.toString),T=D(String.prototype.match),y=D(String.prototype.replace),E=D(String.prototype.indexOf),A=D(String.prototype.trim),_=D(Object.prototype.hasOwnProperty),b=D(RegExp.prototype.test),S=(N=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return s(N,t)});var N;function D(e){return function(t){t instanceof RegExp&&(t.lastIndex=0);for(var n=arguments.length,o=new Array(n>1?n-1:0),r=1;r<n;r++)o[r-1]=arguments[r];return c(e,t,o)}}function R(e,o){let r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:h;t&&t(e,null);let i=o.length;for(;i--;){let t=o[i];if("string"==typeof t){const e=r(t);e!==t&&(n(o)||(o[i]=e),t=e)}e[t]=!0}return e}function w(e){for(let t=0;t<e.length;t++){_(e,t)||(e[t]=null)}return e}function C(t){const n=l(null);for(const[o,r]of e(t)){_(t,o)&&(Array.isArray(r)?n[o]=w(r):r&&"object"==typeof r&&r.constructor===Object?n[o]=C(r):n[o]=r)}return n}function O(e,t){for(;null!==e;){const n=r(e,t);if(n){if(n.get)return D(n.get);if("function"==typeof n.value)return D(n.value)}e=o(e)}return function(){return null}}const v=i(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","search","section","select","shadow","slot","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),k=i(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","enterkeyhint","exportparts","filter","font","g","glyph","glyphref","hkern","image","inputmode","line","lineargradient","marker","mask","metadata","mpath","part","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),x=i(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feDropShadow","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),L=i(["animate","color-profile","cursor","discard","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),I=i(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover","mprescripts"]),M=i(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),U=i(["#text"]),z=i(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","exportparts","face","for","headers","height","hidden","high","href","hreflang","id","inert","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","part","pattern","placeholder","playsinline","popover","popovertarget","popovertargetaction","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","slot","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","wrap","xmlns","slot"]),P=i(["accent-height","accumulate","additive","alignment-baseline","amplitude","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","exponent","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","intercept","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","mask-type","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","slope","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","tablevalues","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),F=i(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),H=i(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),B=a(/\{\{[\w\W]*|[\w\W]*\}\}/gm),G=a(/<%[\w\W]*|[\w\W]*%>/gm),W=a(/\$\{[\w\W]*/gm),Y=a(/^data-[\-\w.\u00B7-\uFFFF]+$/),j=a(/^aria-[\-\w]+$/),X=a(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),q=a(/^(?:\w+script|data):/i),$=a(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),K=a(/^html$/i),V=a(/^[a-z][.\w]*(-[.\w]+)+$/i);var Z=Object.freeze({__proto__:null,ARIA_ATTR:j,ATTR_WHITESPACE:$,CUSTOM_ELEMENT:V,DATA_ATTR:Y,DOCTYPE_NAME:K,ERB_EXPR:G,IS_ALLOWED_URI:X,IS_SCRIPT_OR_DATA:q,MUSTACHE_EXPR:B,TMPLIT_EXPR:W});const J=1,Q=3,ee=7,te=8,ne=9,oe=function(){return"undefined"==typeof window?null:window};var re=function t(){let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:oe();const o=e=>t(e);if(o.version="3.3.3",o.removed=[],!n||!n.document||n.document.nodeType!==ne||!n.Element)return o.isSupported=!1,o;let{document:r}=n;const a=r,c=a.currentScript,{DocumentFragment:s,HTMLTemplateElement:N,Node:D,Element:w,NodeFilter:B,NamedNodeMap:G=n.NamedNodeMap||n.MozNamedAttrMap,HTMLFormElement:W,DOMParser:Y,trustedTypes:j}=n,q=w.prototype,$=O(q,"cloneNode"),V=O(q,"remove"),re=O(q,"nextSibling"),ie=O(q,"childNodes"),ae=O(q,"parentNode");if("function"==typeof N){const e=r.createElement("template");e.content&&e.content.ownerDocument&&(r=e.content.ownerDocument)}let le,ce="";const{implementation:se,createNodeIterator:ue,createDocumentFragment:me,getElementsByTagName:pe}=r,{importNode:fe}=a;let de={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]};o.isSupported="function"==typeof e&&"function"==typeof ae&&se&&void 0!==se.createHTMLDocument;const{MUSTACHE_EXPR:he,ERB_EXPR:ge,TMPLIT_EXPR:Te,DATA_ATTR:ye,ARIA_ATTR:Ee,IS_SCRIPT_OR_DATA:Ae,ATTR_WHITESPACE:_e,CUSTOM_ELEMENT:be}=Z;let{IS_ALLOWED_URI:Se}=Z,Ne=null;const De=R({},[...v,...k,...x,...I,...U]);let Re=null;const we=R({},[...z,...P,...F,...H]);let Ce=Object.seal(l(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),Oe=null,ve=null;const ke=Object.seal(l(null,{tagCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeCheck:{writable:!0,configurable:!1,enumerable:!0,value:null}}));let xe=!0,Le=!0,Ie=!1,Me=!0,Ue=!1,ze=!0,Pe=!1,Fe=!1,He=!1,Be=!1,Ge=!1,We=!1,Ye=!0,je=!1,Xe=!0,qe=!1,$e={},Ke=null;const Ve=R({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]);let Ze=null;const Je=R({},["audio","video","img","source","image","track"]);let Qe=null;const et=R({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),tt="http://www.w3.org/1998/Math/MathML",nt="http://www.w3.org/2000/svg",ot="http://www.w3.org/1999/xhtml";let rt=ot,it=!1,at=null;const lt=R({},[tt,nt,ot],g);let ct=R({},["mi","mo","mn","ms","mtext"]),st=R({},["annotation-xml"]);const ut=R({},["title","style","font","a","script"]);let mt=null;const pt=["application/xhtml+xml","text/html"];let ft=null,dt=null;const ht=r.createElement("form"),gt=function(e){return e instanceof RegExp||e instanceof Function},Tt=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(!dt||dt!==e){if(e&&"object"==typeof e||(e={}),e=C(e),mt=-1===pt.indexOf(e.PARSER_MEDIA_TYPE)?"text/html":e.PARSER_MEDIA_TYPE,ft="application/xhtml+xml"===mt?g:h,Ne=_(e,"ALLOWED_TAGS")?R({},e.ALLOWED_TAGS,ft):De,Re=_(e,"ALLOWED_ATTR")?R({},e.ALLOWED_ATTR,ft):we,at=_(e,"ALLOWED_NAMESPACES")?R({},e.ALLOWED_NAMESPACES,g):lt,Qe=_(e,"ADD_URI_SAFE_ATTR")?R(C(et),e.ADD_URI_SAFE_ATTR,ft):et,Ze=_(e,"ADD_DATA_URI_TAGS")?R(C(Je),e.ADD_DATA_URI_TAGS,ft):Je,Ke=_(e,"FORBID_CONTENTS")?R({},e.FORBID_CONTENTS,ft):Ve,Oe=_(e,"FORBID_TAGS")?R({},e.FORBID_TAGS,ft):C({}),ve=_(e,"FORBID_ATTR")?R({},e.FORBID_ATTR,ft):C({}),$e=!!_(e,"USE_PROFILES")&&e.USE_PROFILES,xe=!1!==e.ALLOW_ARIA_ATTR,Le=!1!==e.ALLOW_DATA_ATTR,Ie=e.ALLOW_UNKNOWN_PROTOCOLS||!1,Me=!1!==e.ALLOW_SELF_CLOSE_IN_ATTR,Ue=e.SAFE_FOR_TEMPLATES||!1,ze=!1!==e.SAFE_FOR_XML,Pe=e.WHOLE_DOCUMENT||!1,Be=e.RETURN_DOM||!1,Ge=e.RETURN_DOM_FRAGMENT||!1,We=e.RETURN_TRUSTED_TYPE||!1,He=e.FORCE_BODY||!1,Ye=!1!==e.SANITIZE_DOM,je=e.SANITIZE_NAMED_PROPS||!1,Xe=!1!==e.KEEP_CONTENT,qe=e.IN_PLACE||!1,Se=e.ALLOWED_URI_REGEXP||X,rt=e.NAMESPACE||ot,ct=e.MATHML_TEXT_INTEGRATION_POINTS||ct,st=e.HTML_INTEGRATION_POINTS||st,Ce=e.CUSTOM_ELEMENT_HANDLING||{},e.CUSTOM_ELEMENT_HANDLING&&gt(e.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(Ce.tagNameCheck=e.CUSTOM_ELEMENT_HANDLING.tagNameCheck),e.CUSTOM_ELEMENT_HANDLING&&gt(e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(Ce.attributeNameCheck=e.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),e.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(Ce.allowCustomizedBuiltInElements=e.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),Ue&&(Le=!1),Ge&&(Be=!0),$e&&(Ne=R({},U),Re=l(null),!0===$e.html&&(R(Ne,v),R(Re,z)),!0===$e.svg&&(R(Ne,k),R(Re,P),R(Re,H)),!0===$e.svgFilters&&(R(Ne,x),R(Re,P),R(Re,H)),!0===$e.mathMl&&(R(Ne,I),R(Re,F),R(Re,H))),_(e,"ADD_TAGS")||(ke.tagCheck=null),_(e,"ADD_ATTR")||(ke.attributeCheck=null),e.ADD_TAGS&&("function"==typeof e.ADD_TAGS?ke.tagCheck=e.ADD_TAGS:(Ne===De&&(Ne=C(Ne)),R(Ne,e.ADD_TAGS,ft))),e.ADD_ATTR&&("function"==typeof e.ADD_ATTR?ke.attributeCheck=e.ADD_ATTR:(Re===we&&(Re=C(Re)),R(Re,e.ADD_ATTR,ft))),e.ADD_URI_SAFE_ATTR&&R(Qe,e.ADD_URI_SAFE_ATTR,ft),e.FORBID_CONTENTS&&(Ke===Ve&&(Ke=C(Ke)),R(Ke,e.FORBID_CONTENTS,ft)),e.ADD_FORBID_CONTENTS&&(Ke===Ve&&(Ke=C(Ke)),R(Ke,e.ADD_FORBID_CONTENTS,ft)),Xe&&(Ne["#text"]=!0),Pe&&R(Ne,["html","head","body"]),Ne.table&&(R(Ne,["tbody"]),delete Oe.tbody),e.TRUSTED_TYPES_POLICY){if("function"!=typeof e.TRUSTED_TYPES_POLICY.createHTML)throw S('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');if("function"!=typeof e.TRUSTED_TYPES_POLICY.createScriptURL)throw S('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');le=e.TRUSTED_TYPES_POLICY,ce=le.createHTML("")}else void 0===le&&(le=function(e,t){if("object"!=typeof e||"function"!=typeof e.createPolicy)return null;let n=null;const o="data-tt-policy-suffix";t&&t.hasAttribute(o)&&(n=t.getAttribute(o));const r="dompurify"+(n?"#"+n:"");try{return e.createPolicy(r,{createHTML:e=>e,createScriptURL:e=>e})}catch(e){return console.warn("TrustedTypes policy "+r+" could not be created."),null}}(j,c)),null!==le&&"string"==typeof ce&&(ce=le.createHTML(""));i&&i(e),dt=e}},yt=R({},[...k,...x,...L]),Et=R({},[...I,...M]),At=function(e){f(o.removed,{element:e});try{ae(e).removeChild(e)}catch(t){V(e)}},_t=function(e,t){try{f(o.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){f(o.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e)if(Be||Ge)try{At(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},bt=function(e){let t=null,n=null;if(He)e="<remove></remove>"+e;else{const t=T(e,/^[\r\n\t ]+/);n=t&&t[0]}"application/xhtml+xml"===mt&&rt===ot&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");const o=le?le.createHTML(e):e;if(rt===ot)try{t=(new Y).parseFromString(o,mt)}catch(e){}if(!t||!t.documentElement){t=se.createDocument(rt,"template",null);try{t.documentElement.innerHTML=it?ce:o}catch(e){}}const i=t.body||t.documentElement;return e&&n&&i.insertBefore(r.createTextNode(n),i.childNodes[0]||null),rt===ot?pe.call(t,Pe?"html":"body")[0]:Pe?t.documentElement:i},St=function(e){return ue.call(e.ownerDocument||e,e,B.SHOW_ELEMENT|B.SHOW_COMMENT|B.SHOW_TEXT|B.SHOW_PROCESSING_INSTRUCTION|B.SHOW_CDATA_SECTION,null)},Nt=function(e){return e instanceof W&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof G)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore||"function"!=typeof e.hasChildNodes)},Dt=function(e){return"function"==typeof D&&e instanceof D};function Rt(e,t,n){u(e,e=>{e.call(o,t,n,dt)})}const wt=function(e){let t=null;if(Rt(de.beforeSanitizeElements,e,null),Nt(e))return At(e),!0;const n=ft(e.nodeName);if(Rt(de.uponSanitizeElement,e,{tagName:n,allowedTags:Ne}),ze&&e.hasChildNodes()&&!Dt(e.firstElementChild)&&b(/<[/\w!]/g,e.innerHTML)&&b(/<[/\w!]/g,e.textContent))return At(e),!0;if(e.nodeType===ee)return At(e),!0;if(ze&&e.nodeType===te&&b(/<[/\w]/g,e.data))return At(e),!0;if(!(ke.tagCheck instanceof Function&&ke.tagCheck(n))&&(!Ne[n]||Oe[n])){if(!Oe[n]&&Ot(n)){if(Ce.tagNameCheck instanceof RegExp&&b(Ce.tagNameCheck,n))return!1;if(Ce.tagNameCheck instanceof Function&&Ce.tagNameCheck(n))return!1}if(Xe&&!Ke[n]){const t=ae(e)||e.parentNode,n=ie(e)||e.childNodes;if(n&&t){for(let o=n.length-1;o>=0;--o){const r=$(n[o],!0);r.__removalCount=(e.__removalCount||0)+1,t.insertBefore(r,re(e))}}}return At(e),!0}return e instanceof w&&!function(e){let t=ae(e);t&&t.tagName||(t={namespaceURI:rt,tagName:"template"});const n=h(e.tagName),o=h(t.tagName);return!!at[e.namespaceURI]&&(e.namespaceURI===nt?t.namespaceURI===ot?"svg"===n:t.namespaceURI===tt?"svg"===n&&("annotation-xml"===o||ct[o]):Boolean(yt[n]):e.namespaceURI===tt?t.namespaceURI===ot?"math"===n:t.namespaceURI===nt?"math"===n&&st[o]:Boolean(Et[n]):e.namespaceURI===ot?!(t.namespaceURI===nt&&!st[o])&&!(t.namespaceURI===tt&&!ct[o])&&!Et[n]&&(ut[n]||!yt[n]):!("application/xhtml+xml"!==mt||!at[e.namespaceURI]))}(e)?(At(e),!0):"noscript"!==n&&"noembed"!==n&&"noframes"!==n||!b(/<\/no(script|embed|frames)/i,e.innerHTML)?(Ue&&e.nodeType===Q&&(t=e.textContent,u([he,ge,Te],e=>{t=y(t,e," ")}),e.textContent!==t&&(f(o.removed,{element:e.cloneNode()}),e.textContent=t)),Rt(de.afterSanitizeElements,e,null),!1):(At(e),!0)},Ct=function(e,t,n){if(ve[t])return!1;if(Ye&&("id"===t||"name"===t)&&(n in r||n in ht))return!1;if(Le&&!ve[t]&&b(ye,t));else if(xe&&b(Ee,t));else if(ke.attributeCheck instanceof Function&&ke.attributeCheck(t,e));else if(!Re[t]||ve[t]){if(!(Ot(e)&&(Ce.tagNameCheck instanceof RegExp&&b(Ce.tagNameCheck,e)||Ce.tagNameCheck instanceof Function&&Ce.tagNameCheck(e))&&(Ce.attributeNameCheck instanceof RegExp&&b(Ce.attributeNameCheck,t)||Ce.attributeNameCheck instanceof Function&&Ce.attributeNameCheck(t,e))||"is"===t&&Ce.allowCustomizedBuiltInElements&&(Ce.tagNameCheck instanceof RegExp&&b(Ce.tagNameCheck,n)||Ce.tagNameCheck instanceof Function&&Ce.tagNameCheck(n))))return!1}else if(Qe[t]);else if(b(Se,y(n,_e,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==E(n,"data:")||!Ze[e]){if(Ie&&!b(Ae,y(n,_e,"")));else if(n)return!1}else;return!0},Ot=function(e){return"annotation-xml"!==e&&T(e,be)},vt=function(e){Rt(de.beforeSanitizeAttributes,e,null);const{attributes:t}=e;if(!t||Nt(e))return;const n={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:Re,forceKeepAttr:void 0};let r=t.length;for(;r--;){const i=t[r],{name:a,namespaceURI:l,value:c}=i,s=ft(a),m=c;let f="value"===a?m:A(m);if(n.attrName=s,n.attrValue=f,n.keepAttr=!0,n.forceKeepAttr=void 0,Rt(de.uponSanitizeAttribute,e,n),f=n.attrValue,!je||"id"!==s&&"name"!==s||(_t(a,e),f="user-content-"+f),ze&&b(/((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,f)){_t(a,e);continue}if("attributename"===s&&T(f,"href")){_t(a,e);continue}if(n.forceKeepAttr)continue;if(!n.keepAttr){_t(a,e);continue}if(!Me&&b(/\/>/i,f)){_t(a,e);continue}Ue&&u([he,ge,Te],e=>{f=y(f,e," ")});const d=ft(e.nodeName);if(Ct(d,s,f)){if(le&&"object"==typeof j&&"function"==typeof j.getAttributeType)if(l);else switch(j.getAttributeType(d,s)){case"TrustedHTML":f=le.createHTML(f);break;case"TrustedScriptURL":f=le.createScriptURL(f)}if(f!==m)try{l?e.setAttributeNS(l,a,f):e.setAttribute(a,f),Nt(e)?At(e):p(o.removed)}catch(t){_t(a,e)}}else _t(a,e)}Rt(de.afterSanitizeAttributes,e,null)},kt=function(e){let t=null;const n=St(e);for(Rt(de.beforeSanitizeShadowDOM,e,null);t=n.nextNode();)Rt(de.uponSanitizeShadowNode,t,null),wt(t),vt(t),t.content instanceof s&&kt(t.content);Rt(de.afterSanitizeShadowDOM,e,null)};return o.sanitize=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=null,r=null,i=null,l=null;if(it=!e,it&&(e="\x3c!--\x3e"),"string"!=typeof e&&!Dt(e)){if("function"!=typeof e.toString)throw S("toString is not a function");if("string"!=typeof(e=e.toString()))throw S("dirty is not a string, aborting")}if(!o.isSupported)return e;if(Fe||Tt(t),o.removed=[],"string"==typeof e&&(qe=!1),qe){if(e.nodeName){const t=ft(e.nodeName);if(!Ne[t]||Oe[t])throw S("root node is forbidden and cannot be sanitized in-place")}}else if(e instanceof D)n=bt("\x3c!----\x3e"),r=n.ownerDocument.importNode(e,!0),r.nodeType===J&&"BODY"===r.nodeName||"HTML"===r.nodeName?n=r:n.appendChild(r);else{if(!Be&&!Ue&&!Pe&&-1===e.indexOf("<"))return le&&We?le.createHTML(e):e;if(n=bt(e),!n)return Be?null:We?ce:""}n&&He&&At(n.firstChild);const c=St(qe?e:n);for(;i=c.nextNode();)wt(i),vt(i),i.content instanceof s&&kt(i.content);if(qe)return e;if(Be){if(Ge)for(l=me.call(n.ownerDocument);n.firstChild;)l.appendChild(n.firstChild);else l=n;return(Re.shadowroot||Re.shadowrootmode)&&(l=fe.call(a,l,!0)),l}let m=Pe?n.outerHTML:n.innerHTML;return Pe&&Ne["!doctype"]&&n.ownerDocument&&n.ownerDocument.doctype&&n.ownerDocument.doctype.name&&b(K,n.ownerDocument.doctype.name)&&(m="<!DOCTYPE "+n.ownerDocument.doctype.name+">\n"+m),Ue&&u([he,ge,Te],e=>{m=y(m,e," ")}),le&&We?le.createHTML(m):m},o.setConfig=function(){Tt(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}),Fe=!0},o.clearConfig=function(){dt=null,Fe=!1},o.isValidAttribute=function(e,t,n){dt||Tt({});const o=ft(e),r=ft(t);return Ct(o,r,n)},o.addHook=function(e,t){"function"==typeof t&&f(de[e],t)},o.removeHook=function(e,t){if(void 0!==t){const n=m(de[e],t);return-1===n?void 0:d(de[e],n,1)[0]}return p(de[e])},o.removeHooks=function(e){de[e]=[]},o.removeAllHooks=function(){de={afterSanitizeAttributes:[],afterSanitizeElements:[],afterSanitizeShadowDOM:[],beforeSanitizeAttributes:[],beforeSanitizeElements:[],beforeSanitizeShadowDOM:[],uponSanitizeAttribute:[],uponSanitizeElement:[],uponSanitizeShadowNode:[]}},o}();return re;
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
