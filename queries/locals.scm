; locals.scm
; See <https://tree-sitter.github.io/tree-sitter/syntax-highlighting#local-variables>
;
; We can use:
;  - @local.scope
;  - @local.definition
;  - @local.reference

; Scopes
;-------

(namespace) @local.scope
(context_definition) @local.scope
(service_definition) @local.scope


; Definitions
;------------

(parameter_definition
  name: (identifier) @local.definition)

(artifact_import
  name: (simple_path) @local.definition)

(entity_definition
  name: (simple_path) @local.definition)

(view_definition
  name: (simple_path) @local.definition)

(type_definition
  name: (simple_path) @local.definition)

(event_definition
  name: (simple_path) @local.definition)

(aspect_definition
  name: (simple_path) @local.definition)


; References
;------------

(from_path . (identifier) @local.reference)
