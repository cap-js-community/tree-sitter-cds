; highlights.scm

; Note: First matches apply

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

[
  ";"
  "."
  ","
] @punctuation.delimiter


[
  "*"
  "+"
  "-"
  "/"
  "||"
] @operator

[
  "true"
  "false"
  (null)
] @constant.builtin

[
  "all"
  "any"
  "as"
  "by"
  "case"
  "cast"
  "distinct"
  "exists"
  "extract"
  "false"
  "from"
  "in"
  "key"
  "new"
  "not"
  "null"
  "of"
  "on"
  "select"
  "some"
  "when"
  "trim"
  "true"
  "where"
  "with"
  "abstract"
  "action"
  "actions"
  "and"
  "annotate"
  "annotation"
  "array"
  "asc"
  "aspect"
  "association"
  "between"
  "both"
  "composition"
  "context"
  "cross"
  "current"
  "day"
  "default"
  "define"
  "desc"
  "element"
  "else"
  "end"
  "entity"
  "enum"
  "event"
  "escape"
  "exact"
  "except"
  "excluding"
  "extend"
  "first"
  "floating"
  "following"
  "full"
  "function"
  "group"
  "having"
  "hour"
  "inner"
  "intersect"
  "into"
  "is"
  "join"
  "last"
  "leading"
  "left"
  "like"
  "limit"
  "localized"
  "many"
  "masked"
  "minus"
  "minute"
  "mixin"
  "month"
  "namespace"
  "nulls"
  "offset"
  "one"
  "or"
  "order"
  "outer"
  "over"
  "parameters"
  "partition"
  "preceding"
  "projection"
  "redirected"
  "returns"
  "right"
  "row"
  "rows"
  "second"
  "service"
  "then"
  "trailing"
  "to"
  "type"
  "union"
  "unbounded"
  "up"
  "using"
  "variable"
  "view"
  "virtual"
  "year"
] @keyword

(comment) @comment

(number) @number
(single_quote_string) @string
(backtick_string) @string
(text_block) @string

(action_definition
  name: (simple_path
    (identifier) @function))
(function_definition
  name: (simple_path
          (identifier) @function))

(parameter_definition type: (_ (_ (_ (identifier) @type))))
(parameter_definition name: (identifier) @variable.parameter)

(entity_definition name: (_) @function)
(aspect_definition name: (_) @function)
(type_definition name: (_) @function)
(view_definition name: (_) @function)
(event_definition name: (_) @function)
(annotation_definition name: (_) @function)
(context_definition name: (_) @function)
(service_definition name: (_) @function)
(action_definition name: (_) @function)
(function_definition name: (_) @function)

(annotation_assignment _ @attribute) ; mark @

(from_path) @variable
(simple_path) @variable

(identifier) @variable
