// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("class-scheduling-app");


function validateClassRelationships() {
    var classesMissing = [];
    var classPropertiesMissing = [];

    // Find _id's in classes without a matching document in class_properties.
    db.classes.find().forEach(function (classDoc) {
        if (!db.class_properties.findOne({ _id: classDoc._id })) {
            classesMissing.push(classDoc._id);
        }
    });

    // Find _id's in class_properties without a matching document in classes.
    db.class_properties.find().forEach(function (cpDoc) {
        if (!db.classes.findOne({ _id: cpDoc._id })) {
            classPropertiesMissing.push(cpDoc._id);
        }
    });

    // Create the error document.
    var errorDocument = {
        timestamp: new Date(),
        classes_missing: classesMissing,
        class_properties_missing: classPropertiesMissing
    };

    // Insert the error document into the "error" collection.
    db.error.insertOne(errorDocument);

    return errorDocument;
}

print(validateClassRelationships());
  
