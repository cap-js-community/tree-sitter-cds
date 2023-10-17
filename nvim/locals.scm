; locals.scm

; Scopes
;-------

(entity_definition) @scope


; Definitions
;------------

(parameter_definition
  name: (identifier) @definition.var)

(artifact_import
  name: (simple_path) @definition.import)

; References
;------------

(identifier) @reference