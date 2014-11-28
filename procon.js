var Projects = new Mongo.Collection( "projects" );
Meteor.users.allow( { update: function () { return true; } } );

if ( Meteor.isClient ) {

  Template.body.helpers( {
    projects: function( ) {
      var competences = Meteor.user().profile.competence;
      if( competences ) {
        var projectSet = [];
	competences.map( function( tag ) { 
          var results = Projects.find( { tags:tag } );
          results.forEach( function( value ) {
            if( projectSet.indexOf( value ) == -1 ) { //TODO Detta fungerar inte
              projectSet.push( value );
            }
          });
        });

        return projectSet;
      } 
    }
  });

  Template.body.events( {
    "submit .new-competence": function( event ) {
      var text = event.target.text.value;

      Meteor.users.update( { _id: Meteor.userId() }, {$addToSet: { "profile.competence":text } } );

      event.target.text.value = "";

      return false;
    },
    "submit .new-project": function( event ) {
      var name = event.target.name.value;
      var description = event.target.description.value;
      var tags = event.target.tags.value.split( "," ).map( function( value ) { return value.trim() } );
      var owner_id = Meteor.userId();

      var new_project = createProject( name, description, tags, owner_id );

      Projects.insert( new_project );

      event.target.name.value = "";
      event.target.description.value = "";
      event.target.tags.value = "";

      //Prevent default form submit
      return false; 
    },
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

if( Meteor.isServer ) {
  Meteor.startup( function() {
    // code to run on server at startup
  });
  Accounts.onCreateUser( function( options, user ) {
    if( !options.profile )
      user.profile = Object();
    return user;
  });
}

function createProject( project_name, project_description, project_tags, project_owner_id ) {
  var new_project = {
    createdAt: new Date(),
    name: project_name,
    description: project_description,
    ownerId: project_owner_id,
    tags: project_tags
  };
  return new_project;
}

function getUnique( inArr ) {
   var u = {}, outArr = [];
   for( var i = 0, l = inArr.length; i < l; ++i ) {
      if( u.hasOwnProperty( inArr [i] ) ) {
         continue;
      }
      outArr.push( inArr[ i ] );
      u[ inArr[ i ] ] = 1;
   }
   return outArr;
}
