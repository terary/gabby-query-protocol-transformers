Gabby Query Protocol is concerned with field selection and filter (WHERE).
It does not include update/insert/delete.
It would be fairly easy to extend transformation module to include insert/update/delete.
Insert/Update would require introducing a new recordType (field collection) with it's own
validation. Validation could be used from GQP but it would be a little hacky and beyond
scope of the demo.

    we dont expect dictionary to change
    constructor should be in (subjectDictionary (not json?))
    need to have function updatePorjection(projectionJson)
    it will be convient to use

    either constructor(editor) or constructor(subjectDictionary)

    want to use editor's features.  Its is missing 'updateProjection' which means we'll
    have to recreateSqlClass, resetEditor, or? ...

    -- I think its best to use editor as the constructor isArguments, an recreate
    - can use projectionEditor.add and projectionEditor.removeProjectionItem
    to simulate 'setProjection'


    buy passing in the actual editor editor can/set reset.  This becomes an adapter?Facade?Decorator?
    look at those patterns - find something stick to it.  Try to avoid recreating the wheel
    use editor most work is done already

    constructor().selectColums() .selectColumsSqlString()

    if only using editor - this becomes a namespace or an object with function properties.
