'use strict';

module.exports = grammar({
  name: 'cds',

  word: $ => $._unquoted_identifier,

  supertypes: $ => [],

  extras: $ => [
    $.comment,
    // from language.g4
    // \u00A0 : NBSP
    // \uFEFF : byte-order-mark
    // eslint-disable-next-line no-control-regex
    /[\r\n\u2028\u2029 \t\f\u000B\u00A0\u1680\u180e\u2000-\u200A\u202F\u205F\u3000\uFEFF]+/,
  ],

  inline: $ => [
  ],

  conflicts: $ => [
    [ $.parenthesized_expression, $.query_primary ],
    [ $.annotation_path ],
    [ $.annotation_variant ],
    [ $._annotation_assignment_inner ],
  ],

  precedences: $ => [
    [
      'unary',
      'binary_concat',
      'binary_times',
      'binary_plus',
      'binary_comparison',
      'logical_and',
      'logical_or',
    ],
  ],

  externals: $ => [
    $._automatic_semicolon,
  ],

  rules: {
    cds: $ => repeat(
      choice(
        $.using,
        $.namespace,
        $._definition,
      ),
    ),

    namespace: $ => seq(
      kw('namespace'),
      field('path', $.simple_path),
      $._required_semicolon,
    ),

    using: $ => seq(
      kw('using'),
      seq(
        optional(field('imports', choice(
          $.artifact_import,
          seq('{', list_of_trailing($.artifact_import), '}'),
        ))),
        optional(seq(kw('from'), field('file', $._string))),
      ),
      ';', // not $._required_semicolon
    ),

    artifact_import: $ => seq(
      $.simple_path,
      optional(seq(kw('as'), field("alias", $.identifier))),
    ),

    _definition: $ => seq(
      repeat($.annotation),
      choice(
        seq(
          optional_kw('define'),
          choice(
            $.context_definition,
            $.service_definition,
            $.entity_definition,
            $.event_definition,
            $.aspect_definition,
            $.type_definition,
            $.annotation_definition,
            $.view_definition,
            $._action_or_function_definition,
          ),
        ),
        seq(
          kw('extend'),
          choice(
            $.extend_context_or_service,
            $.extend_structure,
            $.extend_projection,
            $.extend_artifact,
          ),
        ),
        $.annotate_artifact,
      ),
    ),

    context_definition: $ => seq(
      kw('context'),
      $._context_or_service_body,
    ),

    service_definition: $ => seq(
      kw('service'),
      $._context_or_service_body,
    ),

    _context_or_service_body: $ => seq(
      def_path_name($),
      repeat($.annotation),
      choice(
        seq('{', repeat($._definition), '}', optional(';')),
        $._required_semicolon,
      ),
    ),

    entity_definition: $ => seq(
      optional_kw('abstract'),
      kw('entity'),
      def_path_name($),
      repeat($.annotation),
      optional($.parameter_list),
      choice(
        seq(
          optional(seq(':', field('includes', optional(list_of_trailing($.simple_path))))),
          field('elements', $.element_definitions),
          optional($.bound_actions),
          optional(';'),
        ),
        seq(
          kw('as'),
          $.query_expression,
          choice(
            seq($.bound_actions, optional(';')),
            $._required_semicolon,
          ),
        ),
        seq(
          kw('as'),
          $.projection_clause,
          seq(
            optional(seq(kw('where'), $._condition)),
            optional(seq(kw('group'), kw('by'), list_of($._expression))),
            optional(seq(kw('having'), $._condition)),
            optional($.order_by_clause),
            optional($.limit_clause),
          ),
          optional($.bound_actions),
          optional(';'),
        ),
      ),
    ),

    event_definition: $ => seq(
      kw('event'),
      def_path_name($),
      repeat($.annotation),
      choice(
        seq($.element_definitions, optional(';')),
        seq(':',
          choice(
            seq($.element_definitions, optional(';')),
            seq($.projection_clause, $._required_semicolon),
            seq(
              field('includes', optional_list_of_trailing($.simple_path)),
              $.element_definitions,
              optional(';'),
            ),
          ),
        ),
      ),
    ),

    projection_clause: $ => seq(
      kw('projection'),
      kw('on'),
      $.from_path,
      optional(seq(':', $.from_path)),
      optional(seq(kw('as'), field('alias', $.identifier))),
      optional($.select_item_definition_list),
      optional($.excluding_clause),
    ),

    select_item_definition_list: $ => seq(
      '{', optional_list_of_trailing($.select_item_definition), '}',
    ),

    excluding_clause: $ => seq(
      kw('excluding'),
      '{', list_of_trailing($.identifier), '}',
    ),

    from_path: $ => list_of(seq(
      $.identifier,
      optional(
        choice(
          seq($.from_arguments, optional($.cardinality_and_filter)),
          $.cardinality_and_filter,
        ),
      )),
      '.',
    ),

    from_arguments: $ => seq(
      '(', list_of_trailing($.named_argument), ')',
    ),

    cardinality_and_filter: $ => seq(
      '[',
      optional(seq($.number, ':')),
      optional_kw('where'),
      $._condition,
      ']',
    ),

    _condition: $ => choice(
      $.unary_condition,
      $.exists_expression,
      $.binary_condition,
      $._expression,
      $.predicate_condition,
      $.ternary,
    ),

    ternary: $ => seq(
      $._condition,
      '?',
      field('then', $._expression),
      ':',
      field('else', $._expression),
    ),

    binary_condition: $ => choice(
      ...[
        [kw('and'), 'logical_and'],
        [kw('or'), 'logical_or'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._condition),
          field('operator', operator),
          field('right', $._condition),
        )),
      ),
      prec.left('binary_comparison', seq(
        field('left', $._condition),
        field('operator', choice('=', '<>', '>' , '>=', '<', '<=', '!=')),
        optional(field('count', choice(kw('any'), kw('some'), kw('all')))),
        field('right', $._condition),
      )),
      prec.left('binary_comparison', seq(
        field('left', $._condition),
        seq(
          field('operator', kw('is'))),
          field('right', seq(optional_kw('not'), $.null),
        ),
      )),
    ),

    unary_condition: $ => prec.left('unary', seq(
      field('operator', kw('not')),
      field('argument', $._condition),
    )),

    exists_expression: $ => seq(
      kw('exists'),
      choice(
        seq('(', $.query_expression, ')'),
        $.value_path,
      ),
    ),

    predicate_condition: $ => seq(
      $._expression,
      optional(kw('not')),
      choice(
        seq(kw('in'), $._expression),
        seq(kw('between'), field('left', $._expression), kw('and'), field('right', $._expression)),
        seq(kw('like'), $._expression, optional(seq(kw('escape'), $._expression))),
      ),
    ),

    _expression: $ => choice(
      $._literal,
      $.value_path,
      $._special_function,
      $.binary_expression,
      $.unary_expression,
      $.new_expression,
      $.over_expression,
      $.case_expression,
      $.parenthesized_expression,
      $.parameter_ref_expression,
    ),

    binary_expression: $ => choice(
      ...[
        ['||', 'binary_concat'],
        ['+', 'binary_plus'],
        ['-', 'binary_plus'],
        ['*', 'binary_times'],
        ['/', 'binary_times'],
      ].map(([operator, precedence]) =>
        prec.left(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        )),
      ),
    ),

    unary_expression: $ => prec.left('unary', seq(
      field('operator', choice('+', '-')),
      field('argument', $._expression),
    )),

    new_expression: $ => seq(
      field('operator', kw('new')),
      field('argument', $.value_path),
    ),

    over_expression: $ => seq(
      $.value_path,
      $.over_clause,
    ),

    case_expression: $ => seq(
      kw('case'),
      seq(
        optional($._expression),
        repeat1(
          seq(
            kw('when'),
            $._expression,
            kw('then'),
            $._expression,
          ),
        ),
      ),
      optional(seq(kw('else'), $._expression)),
      kw('end'),
    ),

    parameter_ref_expression: $ => seq(':', choice($.value_path, $.number)),
    parenthesized_expression: $ => seq(
      '(',
      choice(
        seq($.query_expression),
        seq(
          $._condition,
          optional(
            seq(
              ',',
              list_of_trailing($._expression),
            ),
          ),
        ),
      ),
      ')',
    ),

    over_clause: $ => seq(
      kw('over'),
      '(',
      optional($.partition_by_clause),
      optional($.over_order_by_clause),
      optional($.window_frame_clause),
      ')',
    ),

    partition_by_clause: $ => seq(
      kw('partition'),
      kw('by'),
      list_of($._expression),
    ),

    over_order_by_clause: $ => seq(
      kw('order'),
      kw('by'),
      list_of($.order_by_spec),
    ),

    order_by_spec: $ => seq(
      $._expression,
      optional(choice(kw('asc'), kw('desc'))),
      optional(seq(kw('nulls'), choice(kw('first'), kw('last')))),
    ),

    window_frame_clause: $ => seq(
      kw('rows'),
      choice(
        $.window_frame_start,
        seq(
          kw('between'),
          field('left', $.window_frame_start),
          kw('and'),
          field('right', $.window_frame_end),
        ),
      ),
    ),


    // *_start should only allow preceding, *_end only following, for "unbounded", but
    // for simplicity, we allow both.
    window_frame_start: $ => $._window_frame_start_end,
    window_frame_end: $ => $._window_frame_start_end,
    _window_frame_start_end: $ => choice(
      seq(kw('unbounded'), choice(kw('following'), kw('preceding'))),
      seq(field('offset', $.number), choice(kw('following'), kw('preceding'))),
      seq(kw('current'), kw('row')),
    ),

    function_trim: $ => seq(
      kw('trim'),
      '(',
      choice(
        seq(
          choice(kw('leading'), kw('trailing'), kw('both')),
          optional($._expression),
          kw('from'),
          $._expression,
        ),
        seq(
          $._expression,
          optional(seq(kw('from'), $._expression)),
        ),
      ),
      ')',
    ),
    function_extract: $ => seq(
      kw('extract'),
      '(',
      choice(kw('year'), kw('month'), kw('day'), kw('hour'), kw('minute'), kw('second')),
      kw('from'),
      $._expression,
      ')',
    ),
    function_cast: $ => seq(
      kw('cast'),
      '(',
      $._expression,
      kw('as'),
      $.type_reference,
      ')',
    ),

    // We have a few special functions that are handled in syntax.
    _special_function: $ => choice(
      $.function_trim,
      $.function_extract,
      $.function_cast,
    ),

    value_path: $ => list_of(
      seq(
        $.identifier,
        optional($.path_arguments),
        optional($.cardinality_and_filter),
      ),
      '.',
    ),

    path_arguments: $ => seq(
      '(',
      optional(choice(
        list_of_trailing($.named_argument),
        list_of_trailing($.arrowed_expression),
        list_of_trailing($._expression),
        seq(kw('all'), $._expression),
        list_of(seq(kw('distinct'), $._expression)),
        '*',
      )),
      ')',
    ),

    named_argument: $ => seq(
      $.identifier,
      ':',
      $._expression,
    ),

    arrowed_expression: $ => seq($.identifier, '=>', $._expression),

    element_definitions: $ => seq(
      '{',
      repeat(seq(
        repeat($.annotation),
        $.element_definition,
      )),
      '}',
    ),

    type_type_of: $ => seq(
      kw('type'),
      kw('of'),
      $.simple_path,
      optional(seq(':', $.simple_path)),
    ),

    type_reference: $ => seq(
      field('name', $.simple_path),
      optional(
        choice(
          seq('(', field('parameter', optional_list_of_trailing($.type_argument)), ')'),
          seq(':', $.simple_path),
        ),
      ),
    ),

    type_argument: $ => seq(
      optional(field('type_param', seq($.identifier, ':'))),
      field('value', choice(
        $.number,
        kw('variable'),
        kw('floating'),
      )),
    ),

    enum_symbol_definition: $ => seq(
      repeat($.annotation),
      field('name', $.identifier),
      repeat($.annotation),
      optional(
        seq(
          '=',
          choice(
            $._literal,
            seq(choice('+', '-'), $.number),
          ),
          repeat($.annotation),
        ),
      ),
      $._required_semicolon,
    ),

    bound_actions: $ => seq(
      kw('actions'),
      '{',
      repeat(seq(
        repeat($.annotation),
        $._action_or_function_definition,
      )),
      '}',
    ),

    element_definition: $ => seq(
      optional_kw('virtual'),
      optional_kw('key'),
      optional_kw('masked'),
      optional_kw('element'),
      field('name', alias($.identifier, $.name)),
      repeat($.annotation),
      choice(
        $._type_definition_body,
        $._required_semicolon,
      ),
    ),

    element_properties: $ => choice(
      $.default_and_nullability,
      $.calc_element_assignment,
    ),

    element_enum_definition: $ => seq(kw('enum'), '{', repeat($.enum_symbol_definition), '}'),

    array_of: $ => choice(kw('many'), seq(kw('array'), kw('of'))),

    type_definition: $ => seq(kw('type'), $._type_like_definition),
    annotation_definition: $ => seq(kw('annotation'), $._type_like_definition),
    _type_like_definition: $ => seq(
      def_path_name($),
      repeat($.annotation),
      choice(
        $._type_definition_body,
        $._required_semicolon,
      ),
    ),

    aspect_definition: $ => seq(
      kw('aspect'),
      def_path_name($),
      repeat($.annotation),
      optional(seq(':', field('includes', optional_list_of_trailing($.simple_path)))),
      choice(
        seq(
          $.element_definitions,
          optional($.bound_actions),
          optional(';'),
        ),
        $._required_semicolon,
      ),
    ),

    type_association_base: $ => seq(
      choice(kw('association'), kw('composition')),
      optional($.cardinality),
      choice(kw('to'), kw('of')),
    ),

    to_one_or_many_path: $ => seq(
      optional(choice(kw('one'), kw('many'))),
      $.simple_path,
    ),

    _type_reference_or_inline_definition: $ => seq(
      optional($.array_of),
      choice(
        seq($.element_definitions, optional($.nullability)),
        seq($.type_type_of, optional($.nullability)),
        seq(
          $.type_reference,
          optional($.nullability), // older versions
          optional($.element_enum_definition),
          optional($.nullability), // newer CDS versions
        ),
      ),
    ),

    _type_definition_body: $ => choice(
      seq(
        $.element_definitions,
        choice(
          seq($.nullability, $._required_semicolon),
          optional(';'),
        ),
      ),
      seq(
        ':',
        choice(
          seq(
            $.element_definitions,
            choice(
              seq($.nullability, $._required_semicolon),
              optional(';'),
            ),
          ),
          seq(
            $.type_association_base,
            choice(
              seq($.element_definitions, optional(';')),
              seq(kw('one'), $.element_definitions, optional(';')),
              seq(kw('many'), $.element_definitions, optional(';')),
              seq($.to_one_or_many_path, $.type_association_element_cont),
            ),
          ),
          seq(
            $.array_of,
            choice(
              seq($.element_definitions, optional($.nullability), optional(';')),
              seq(
                choice($.type_type_of, $.type_reference),
                optional($.nullability),
                repeat($.annotation),
                choice(
                  seq(
                    seq($.element_enum_definition, choice(optional(';'), seq($.element_properties, $._required_semicolon))),
                    seq(optional($.element_properties), $._required_semicolon),
                  ),
                  $._required_semicolon,
                ),
              ),
            ),
          ),
          seq(
            $.type_type_of,
            // optional($.nullability),
            repeat($.annotation),
            choice(
              seq($.element_enum_definition, choice(optional(';'), seq($.element_properties, $._required_semicolon))),
              seq(optional($.element_properties), $._required_semicolon),
              $._required_semicolon,
            ),
          ),
          seq(
            kw('localized'),
            $.type_reference,
            optional($.element_properties),
            repeat($.annotation),
            $._required_semicolon,
          ),
          seq(
            field('type', $.simple_path),
            choice(
              seq(
                '(', optional_list_of_trailing($.type_argument), ')',
                repeat($.annotation),
                choice(
                  seq($.element_enum_definition, choice(optional(';'), seq($.element_properties, $._required_semicolon))),
                  seq(optional($.element_properties), $._required_semicolon),
                ),
              ),
              seq(
                ':',
                $.simple_path,
                // optional($.nullability),
                repeat($.annotation),
                choice(
                  seq($.element_enum_definition, choice(optional(';'), seq($.element_properties, $._required_semicolon))),
                  seq(optional($.element_properties), $._required_semicolon),
                ),
              ),
              seq(
                repeat($.annotation),
                choice(
                  seq($.element_enum_definition, choice(optional(';'), seq($.element_properties, $._required_semicolon))),
                  seq(optional($.element_properties), $._required_semicolon),
                ),
              ),
              seq(
                repeat(seq(',', $.simple_path)),
                $.element_definitions,
                optional(';'),
              ),
            ),
          ),
        ),
      ),
      seq(
        $.calc_element_assignment,
        $._required_semicolon,
      ),
    ),

    calc_element_assignment: $ =>  seq(
      '=',
      $._expression,
      optional(kw('stored')),
    ),

    type_association_cont: $ => choice(
      seq('{', optional_list_of_trailing($.foreign_key), '}', optional($.default_and_nullability)),
      seq(kw('on'), $._condition),
      $.default_and_nullability,
    ),

    type_association_element_cont: $ => seq(
      optional(
        choice(
          seq('{', optional_list_of_trailing($.foreign_key), '}', optional($.default_and_nullability)),
          seq(kw('on'), $._condition),
          $.default_and_nullability,
        ),
      ),
      repeat($.annotation),
      $._required_semicolon,
    ),

    foreign_key: $ => seq(
      repeat($.annotation),
      $.simple_path,
      optional(seq(kw('as'), $.identifier)),
    ),

    view_definition: $ => seq(
      kw('view'),
      def_path_name($),
      repeat($.annotation),
      optional(choice(
        $.parameter_list,
        seq(
          kw('with'), kw('parameters'),
          list_of_trailing($.parameter_definition),
        ),
      )),
      kw('as'),
      $.query_expression,
      $._required_semicolon,
    ),

    _action_or_function_definition: $ => choice(
      $.function_definition,
      $.action_definition,
    ),
    function_definition: $ => seq(
      // Attention: No annotation assignment at this position!
      // Note: Functions require a return type, but we allow not having one.
      kw('function'),
      $._action_or_function_body,
    ),
    action_definition: $ => seq(
      // Attention: No annotation assignment at this position!
      kw('action'),
      $._action_or_function_body,
    ),
    _action_or_function_body: $ => seq(
      def_path_name($),
      repeat($.annotation),
      $.parameter_list,
      choice( $.return_type, $._required_semicolon ),
    ),

    parameter_list: $ => seq(
      '(',
      optional_list_of_trailing($.parameter_definition),
      ')',
    ),

    parameter_definition: $ => seq(
      repeat($.annotation),
      field('name', alias($.identifier, $.name)),
      repeat($.annotation),
      field('type', choice(
        $.element_definitions,
        seq(':', $._type_reference_or_inline_definition),
      )),
      optional($.default_value),
      repeat($.annotation),
    ),

    return_type: $ => seq(
      kw('returns'),
      repeat($.annotation),
      field('type', $._type_reference_or_inline_definition),
      $._required_semicolon,
    ),

    extend_context_or_service: $ => seq(
      field('kind', choice(kw('context'), kw('service'))),
      ref_definition($),
      optional(kw('with')),
      repeat($.annotation),
      choice(
        seq('{', repeat($._definition), '}', optional(';')),
        $._required_semicolon,
      ),
    ),

    extend_structure: $ => seq(
      choice(kw('type'), kw('aspect'), kw('entity')),
      ref_definition($),
      choice(
        seq(
          kw('with'),
          repeat($.annotation),
          choice(
            seq(list_of($.simple_path), $._required_semicolon),
            $._extend_structure_body,
          ),
        ),
        seq(
          repeat($.annotation),
          $._extend_structure_body,
        ),
      ),
    ),

    extend_projection: $ => seq(
      kw('projection'),
      ref_definition($),
      optional_kw('with'),
      repeat($.annotation),
      choice(
        seq(
          '{',
          optional_list_of_trailing($.select_item_definition),
          '}',
          optional($.bound_actions),
          optional(';'),
        ),
        seq(
          $.bound_actions,
          optional(';'),
        ),
        $._required_semicolon,
      ),
    ),

    extend_artifact: $ => seq(
      ref_definition_with_optional_element($),
      choice(
        seq(
          repeat($.annotation),
          choice(
            seq('{', repeat($._element_definition_or_extend), '}', optional(';')),
            $._required_semicolon,
          ),
        ),
        seq(
          kw('with'),
          repeat($.annotation),
          choice(
            seq(list_of($.simple_path), $._required_semicolon),
            $._required_semicolon,
            seq('(', optional_list_of_trailing($.type_argument), ')', $._required_semicolon),
            seq(optional(kw('elements')), '{', repeat($._element_definition_or_extend), '}', optional(';')),
            seq(kw('definitions'), '{', repeat($._definition), '}', optional(';')),
            seq(kw('columns'), '{', optional_list_of_trailing($.select_item_definition), '}', optional(';')),
            seq($.bound_actions, optional(';')),
            seq($.element_enum_definition, optional(';')),
          ),
        ),
      ),
    ),

    _extend_structure_body: $ => choice(
      seq(
        '{',
        repeat($._element_definition_or_extend),
        '}',
        optional($.bound_actions),
        optional(';'),
      ),
      seq(
        $.bound_actions,
        optional(';'),
      ),
      $._required_semicolon,
    ),

    select_item_definition: $ => choice(
      '*',
      seq(
        repeat($.annotation),
        optional_kw('virtual'),
        optional_kw('key'),
        $._select_item_definition_body,
      ),
    ),

    _select_item_definition_body: $ => seq(
      choice(
        seq(
          $._expression,
          optional(seq(optional(kw('as')), $.identifier)),
          optional(
            choice(
              seq(
                $.select_item_inline_list,
                optional($.excluding_clause),
              ),
              seq(
                choice(
                  seq(
                    '.{',
                    optional_list_of_trailing($.select_item_inline_definition),
                    '}',
                    optional($.excluding_clause),
                  ),
                  '.*',
                ),
              ),
            ),
          ),
        ),
        seq(
          $.select_item_inline_list,
          optional($.excluding_clause),
          kw('as'),
          $.identifier,
        ),
      ),
      repeat($.annotation),
      optional(
        seq(
          ':',
          choice(
            seq(
              kw('redirected'),
              kw('to'),
              $.simple_path,
              choice(
                $.type_association_cont,
                repeat($.annotation),
              ),
            ),
            seq($.type_type_of, repeat($.annotation)),
            seq(
              optional_kw('localized'),
              $.type_reference,
              repeat($.annotation),
            ),
            seq(
              $.type_association_base,
              choice(
                seq(kw('many'), $.simple_path),
                seq(kw('one'), $.simple_path),
                $.simple_path,
              ),
              optional($.type_association_cont),
            ),
          ),
        ),
      ),
    ),

    select_item_inline_list: $ => seq(
      '{',
      optional_list_of_trailing($.select_item_inline_definition),
      '}',
    ),

    select_item_inline_definition: $ => choice(
      '*',
      seq(repeat($.annotation), $._select_item_definition_body),
    ),

    _element_definition_or_extend: $ => seq(
      repeat($.annotation),
      choice(
        seq(kw('extend'), $.extend_element),
        $.element_definition,
      ),
    ),

    extend_element: $ => seq(
      optional('element'),
      $.identifier,
      choice(
        seq(
          optional(kw('with')),
          repeat($.annotation),
          choice(
            seq(list_of($.simple_path), $._required_semicolon),
            seq('{', repeat($._element_definition_or_extend), '}', optional(';')),
            seq(kw('elements'), '{', repeat($._element_definition_or_extend), '}', optional(';')),
            seq($.element_enum_definition, optional(';')),
            $._required_semicolon,
          ),
        ),
        seq(
          repeat($.annotation),
          choice(
            seq('{', repeat($._element_definition_or_extend), '}', optional(',')),
            $._required_semicolon,
          ),
        ),
      ),
    ),

    order_by_clause: $ => seq(
      kw('order'), kw('by'),
      list_of($.order_by_spec),
    ),

    limit_clause: $ => seq(
      kw('limit'),
      choice($.number, $.null),
      optional(seq(kw('offset'), $.number)),
    ),

    query_expression: $ => seq(
      $.query_term,
      repeat(seq(
        choice(
          seq(kw('union'), optional(choice(kw('distinct'), kw('all')))),
          seq(kw('except'), optional_kw('distinct')),
          seq(kw('minus'), optional_kw('distinct')),
        ),
        $.query_term,
      )),
      optional($.order_by_clause),
      optional($.limit_clause),
    ),

    query_term: $ => seq(
      $.query_primary,
      repeat(
        seq(
          kw('intersect'),
          optional(kw('distinct')),
          $.query_primary,
        ),
      ),
    ),

    query_primary: $ => choice(
      seq('(', $.query_expression, ')'),
      seq(
        kw('select'),
        choice(
          seq(
            kw('from'),
            $.query_source,
            optional(
              seq(
                kw('mixin'),
                '{',
                repeat($.mixin_element_definition),
                '}',
                kw('into'),
              ),
            ),
            optional(choice(kw('all'), kw('distinct'))),
            optional($.select_item_definition_list),
            optional($.excluding_clause),
          ),
          seq(
            optional(choice(kw('all'), kw('distinct'))),
            list_of_trailing($.select_item_definition),
            kw('from'),
            $.query_source,
          ),
        ),
        optional(seq(kw('where'), $._condition)),
        optional(seq(kw('group'), kw('by'), list_of($._expression))),
        optional(seq(kw('having'), $._condition)),
      ),
    ),

    query_source: $ => list_of($.table_expression),

    table_expression: $ => seq(
      $.table_term,
      repeat(
        choice(
          seq($.join_op, $.table_expression, kw('on'), $._condition),
          seq(kw('cross'), kw('join'), $.table_term),
        ),
      ),
    ),

    join_op: $ => choice(
      kw('join'),
      seq(kw('inner'), optional($.join_cardinality), kw('join')),
      seq(kw('left'),  optional_kw('outer'), optional($.join_cardinality), kw('join')),
      seq(kw('right'), optional_kw('outer'), optional($.join_cardinality), kw('join')),
      seq(kw('full'),  optional_kw('outer'), optional($.join_cardinality), kw('join')),
    ),

    join_cardinality: $ => seq(
      choice(
        seq(optional_kw('exact'), kw('one')),
        kw('many'),
      ),
      kw('to'),
      choice(
        seq(optional_kw('exact'), kw('one')),
        kw('many'),
      ),
    ),

    table_term: $ => choice(
      seq(
        $.from_path,
        optional(seq(':', $.from_path)),
        optional(seq(optional_kw('as'), $.identifier)),
      ),
      choice(
        seq('(', $.query_expression, ')', optional('as'), $.identifier),
        seq('(', $.table_expression, ')'),
      ),
    ),

    mixin_element_definition: $ => seq(
      field('name', alias($.identifier, $.name)),
      choice(
        seq(
          ':',
          choice(
            seq(
              $.type_association_base,
              $.to_one_or_many_path,
              optional($.type_association_cont),
            ),
            seq(
              $.type_reference,
              optional(seq('=', $._expression)),
            ),
          ),
        ),
        seq('=', $._expression),
      ),
      $._required_semicolon,
    ),

    annotate_artifact: $ => seq(
      kw('annotate'),
      ref_definition_with_optional_element($),
      optional_kw('with'),
      repeat($.annotation),
      choice(
        seq(
          '{',
          repeat($.annotate_element),
          '}',
          optional($.annotate_action),
          optional(';'),
        ),
        seq($.annotate_action, optional(';')),
        seq(
          '(',
          list_of_trailing($.annotate_param),
          ')',
          choice(
            $.annotate_returns,
            $._required_semicolon,
          ),
        ),
        $.annotate_returns,
        $._required_semicolon,
      ),
    ),

    annotate_action: $ => seq(
      kw('actions'),
      '{',
      repeat(
        seq(
          repeat($.annotation),
          $.identifier,
          repeat($.annotation),
          optional(
            seq(
              '(',
              list_of_trailing($.annotate_param),
              ')',
            ),
          ),
          choice(
            $.annotate_returns,
            $._required_semicolon,
          ),
        ),
      ),
      '}',
    ),

    annotate_returns: $ => seq(
      kw('returns'),
      repeat($.annotation),
      choice(
        seq(
          '{',
          repeat($.annotate_element),
          '}',
          optional(';'),
        ),
        $._required_semicolon,
      ),
    ),

    annotate_element: $ => seq(
      repeat($.annotation),
      $.identifier,
      repeat($.annotation),
      choice(
        seq('{', repeat($.annotate_element), '}', optional(';')),
        $._required_semicolon,
      ),
    ),

    annotate_param: $ => seq(
      repeat($.annotation),
      $.identifier,
      repeat($.annotation),
    ),

    annotation: $ => seq(
      field('sign', '@'),
      choice(
        $._annotation_assignment_inner,
        $.annotation_group,
      ),
    ),

    annotation_group_item:  $ => $._annotation_assignment_inner,
    annotation_group: $ => seq(
      '(',
      list_of_trailing(alias($._annotation_assignment_inner, $.annotation_group_item)),
      ')',
    ),

    _annotation_assignment_inner: $ => seq(
      $.annotation_path,
      optional(seq(':', $.annotation_value)),
    ),

    annotation_path: $ => seq(
      $.identifier,
      repeat(
        seq(
          '.',
          optional('@'),
          $.identifier,
        ),
      ),
      optional($.annotation_variant),
    ),

    annotation_variant: $ => seq(
      '#', $.identifier,
      repeat(
        seq(
          choice('.', '#'),
          optional('@'),
          $.identifier,
        ),
      ),
    ),

    annotation_ellipsis_up_to: $ => seq(
      '...',
      optional(seq(kw('up'), kw('to'), $.annotation_value)),
    ),

    annotation_value: $ => choice(
      seq('{', list_of_trailing($.annotation_named_value), '}'),
      seq('[',
        list_of_trailing(choice($.annotation_ellipsis_up_to, $.annotation_value)),
        ']',
      ),
      $._literal,
      seq(
        choice('+', '-'),
        $.number,
      ),
      seq('(', $._condition, ')'),
      seq(
        optional('@'),
        $.annotation_path,
      ),
    ),


    nullability: $ => seq(optional_kw('not'), $.null),
    default_value: $ => seq(kw('default'), $._expression),
    default_and_nullability: $ => choice(
      seq($.default_value, optional($.nullability)),
      seq($.nullability, optional($.default_value)),
    ),

    annotation_named_value: $ => seq(
      optional('@'),
      $.annotation_path,
      optional(seq(':', $.annotation_value)),
    ),


    _literal: $ => choice(
      seq('#', $.identifier),
      $.null,
      $.boolean,
      $.number,
      $.number,
      $._string,
      $.quoted_literal,
    ),

    quoted_literal: $ => token(seq(
      choice(kw('x'), kw('date'), kw('time'), kw('timestamp')),
      token.immediate(/('[^'\n\r\u2028\u2029]*')+/),
    )),

    cardinality: $ => seq(
      '[',
      optional(
        seq(
          optional(
            choice(
              seq($.number, ','),
              seq('*', ','),
            ),
          ),
          optional(seq($.number,'..')),
          choice(
            $.number,
            '*',
          ),
        ),
      ),
      ']',
    ),

    _string: $ => choice(
      $.single_quote_string,
      $.backtick_string,
      $.text_block,
    ),
    single_quote_string: $ => /('[^'\n\r\u2028\u2029]*')+/,
    // `-strings
    backtick_string: $ => /`([^`\\]|\\[^`]|\\`)*`/,
    // ```-strings
    text_block: $ => seq(
      '```',
      optional(field("language", $.language_identifier)),
      /\r\n?|[\n\u2028\u2029]/,
      /([^`\\]|\\[^`]|\\`)*/,
      '```',
    ),
    language_identifier: $ => /[-_A-Za-z]+/,
    number: $ => /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/,
    number_with_sign: $ => seq(choice('+', '-'), $.number),
    boolean: $ => choice(kw('true'), kw('false')),
    // Explicit token, so that it is shown in the syntax tree
    null: $ => kw('null'),
    simple_path: $ => list_of($.identifier, '.'),

    identifier: $ => choice(
      $._unquoted_identifier,
      $._delimited_identifier,
    ),

    _unquoted_identifier: $ => /[\p{ID_Start}$_][\p{ID_Continue}$\u200C\u200D]*/,
    _delimited_identifier: $ => token(choice(
      // new style
      /!\[[^\]\n\r\u2028\u2029]*](][^\]\n\r\u2028\u2029]*])*/,
      // old-style
      /("[^"\n\r\u2028\u2029]*")+/,
    )),

    comment: $ => token(choice(
      seq('//', /.*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/',
      ),
    )),

    _required_semicolon: $ => choice(';', $._automatic_semicolon),
  },
});

/**
 * Custom error for invalid arguments to our rule-functions.
 */
class InvalidArgument extends Error {}

/**
 * Convenience function for a _definition name_, that is, a node that _introduces_
 * a new name and not a reference.
 *
 * @param {object} $
 * @return {FieldRule}
 */
function def_path_name($) {
  if (arguments.length !== 1)
    throw new InvalidArgument('incorrect number of arguments');
  return field('name', alias($.simple_path, $.name));
}

/**
 * Convenience function for a reference that is either a definition (`E`)
 * or an element (`E:elem`).
 *
 * @param {object} $
 * @return {SeqRule}
 */
function ref_definition_with_optional_element($) {
  if (arguments.length !== 1)
    throw new InvalidArgument('incorrect number of arguments');
  return seq(
    alias($.simple_path, $.definition_reference),
    optional(seq(':', alias($.simple_path, $.element_reference))),
  );
}

/**
 * Convenience function for a reference that is a definition (`E`).
 *
 * @param {object} $
 * @return {AliasRule}
 */
function ref_definition($) {
  if (arguments.length !== 1)
    throw new InvalidArgument('incorrect number of arguments');
  return alias($.simple_path, $.definition_reference);
}

/**
 * A list of `rule`. At least one rule must be parsed.
 *
 * @param {Rule} rule
 * @param {string} separator
 * @return {SeqRule}
 */
function list_of(rule, separator = ',') {
  if (arguments.length > 2)
    throw new InvalidArgument('too many arguments');
  return seq(
    rule,
    repeat(seq(separator, rule)),
  );
}

/**
 * A list of `rule` with an optional trailing `separator`.
 * At least one rule must be parsed.
 *
 * @param {Rule} rule
 * @param {string} separator
 * @return {SeqRule}
 */
function list_of_trailing(rule, separator = ',') {
  if (arguments.length > 2)
    throw new InvalidArgument('too many arguments');
  return seq(
    rule,
    repeat(seq(separator, rule)),
    optional(separator),
  );
}

/**
 * Same as `list_of_trailing()`, but makes the rule optional.
 *
 * @param {Rule} rule
 * @param {string} separator
 * @return {ChoiceRule}
 */
function optional_list_of_trailing(rule, separator = ',') {
  return optional(list_of_trailing(rule, separator));
}

/**
 * A CDS keyword.  The string (keyword) can be parsed case-insensitive.
 *
 * @param {string} str
 * @return {AliasRule}
 */
function kw(str) {
  if (typeof str !== 'string') throw new InvalidArgument('keyword is not a string');
  if (arguments.length !== 1) throw new InvalidArgument('expected exactly one argument');
  // Note: alias() is required for highlights.scm
  return alias(new RegExp(
    str
      .split('')
      .map((c) => `[${c.toLowerCase()}${c.toUpperCase()}]`)
      .join(''),
  ), str);
}

/**
 * Same as `kw()`, but optional.
 *
 * @param {string} str
 * @return {ChoiceRule}
 */
function optional_kw(str) {
  return optional(kw(str));
}
