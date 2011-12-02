var _SQLiteDb;
var daoCallBackEventListeners = {};
$(function(){
	// sqlit database connection
	var databaseOptions = {
			fileName: "sqlite_contacttest",
			version: "1.0",
			displayName: "SQLite Contact Test",
			maxSize: 1024
		};
	_SQLiteDb = openDatabase(
			databaseOptions.fileName,
			databaseOptions.version,
			databaseOptions.displayName,
			databaseOptions.maxSize
		);
		
	brite.registerDao("Groups",new brite.dao.SQLiteDao("Groups","id",[{column:'name',dtype:'TEXT'}]));
	brite.registerDao("Users",new brite.dao.SQLiteDao("Users","id",[{column:'name',dtype:'TEXT'},{column:'email',dtype:'TEXT'},{column:'pno',dtype:'TEXT'}]));	
	brite.registerDao("GroupUser",new brite.dao.SQLiteDao("GroupUser","id",[{column:'group_id',dtype:'INTEGER'},{column:'user_id',dtype:'INTEGER'}]));
	

	
	
	
	

	
	initContactListDiv();
	
	brite.addDataChangeListener("Users",function(daoChangeEvent){
			refreshUserListDiv();
	});
	brite.addDataChangeListener("Groups",function(daoChangeEvent){
			refreshGroupListDiv();
	});
	
	$('#initdb').click(function(){
		initData();
	});
	
	
	

});
function initData(){
	$("#group_div_top").hide();
	brite.dm.remove("Users");
	brite.dm.remove("Groups");
	
	brite.dm.remove("GroupUser");
	
	
	
	brite.dm.create("Users",{email:"001@a.com",name:"Mike1",pno:"123456"});
	brite.dm.create("Users",{email:"002@a.com",name:"Mike2",pno:"123456"});
	brite.dm.create("Users",{email:"003@a.com",name:"Mike3",pno:"123456"});
	brite.dm.create("Users",{email:"004@a.com",name:"Mike4",pno:"123456"});
	brite.dm.create("Users",{email:"005@a.com",name:"Mike5",pno:"123456"});
	
	
	brite.dm.create("Groups",{name:"group1"});
	brite.dm.create("Groups",{name:"group2"});
}
function parseRows2Json(rows){
	var json = [];
	var rlen = rows.length;
	for(var i=0;i<rlen;i++){
		json.push(rows.item(i));
	}
	return json;
}
//  --reload user list --//
function refreshUserListDiv(){
	
//	alert(1);
	brite.dm.list("Users").done(function(results){
		$("#user_div").empty();
		brite.display('UserComponent',results);
	});
}
//-- reload group list--//
function refreshGroupListDiv(){
	
	brite.dm.list("Groups").done(function(results){
		$("#group_div").empty();
		brite.display('GroupComponent',results);	
	});
	
}
//-- init page--//
function initContactListDiv(){
	initData();
	refreshUserListDiv();
	//refreshGroupListDiv();
	
}

//  -----open group div ,set the checked status if the group was selected--//
function addGroupToUser(id){
	brite.dm.get("Users",id).done(function(user){
		$('#selectedUname').html(user.name);
		$('#selectedUid').val(user.id);
		brite.dm.list("GroupUser",{matchs:{user_id:id}}).done(function(userGroupList){
			brite.dm.list("Groups").done(function(groupList){
				var glen = groupList.length;
				for(var i=0;i<glen;i++){
					
					if(isInGroupList(userGroupList,groupList[i])){
						groupList[i].chkflg='checked';
					}else{
						groupList[i].chkflg='';
					}
					
				}
				$("#group_div").empty();
				brite.display('GroupComponent',groupList);	
			});
		});
	});

	$("#group_div_top").show();
}
// -- check the check box status--//
function isInGroupList(list,obj){
	var glen = list.length;
	for(var i=0;i<glen;i++){
			if(list[i].group_id==obj.id){
				return true;
			
		}
				
	}
	return false;
}


function parseUser2Json(user,userGroups){
	var userJson = {};
	userJson.groups = userGroups;
	userJson.id = user.id;
	userJson.name = user.name;
	userJson.email = user.email;
	userJson.pno = user.pno;
	return userJson;
}