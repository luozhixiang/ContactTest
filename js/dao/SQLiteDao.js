//var $tableDefines = {};
(function($) {

	function SQLiteDao(tableName,identity,tableDefine) {
		
		//$tableDefines[tableName] = tableDefine;
		this.init(tableName,identity,tableDefine);
	}

	SQLiteDao.prototype.init = function(tableName,identity,tableDefine) {
		$database.transaction(
			function( transaction ){
 
				var createSql = "CREATE TABLE IF NOT EXISTS "+tableName+" (" +
						identity+" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" ;
				var dlen = tableDefine.length;
				for(var i=0;i<dlen;i++){
					var field = tableDefine[i];
					createSql+=","+field.column+" "+field.dtype;
//					if(field.mapToEntry && field.mapToEntry!=''){
//						createSql+=","+field.column+"_mapToEntry TEXT";
//					}
				}
				createSql+=");"
				//alert(createSql);
				transaction.executeSql(createSql);
 
			}
		);
		this._identity = identity;
		return this;
	}

	// ------ DAO Interface Implementation ------ //
	SQLiteDao.prototype.getIdName = function(tableName) {
		return this._identity||"id";
	}

	SQLiteDao.prototype.get = function(tableName, opts) {
		var obj;
		$database.transaction(
				function( transaction ){
 
					transaction.executeSql(
						(
							"SELECT " +
								"* " +
							"FROM " +
								tableName +
							" where "+brite.dm.getIdName(tableName) +
								"="+opts.id
						),
						[],
						function( transaction, results ){
							if(results && results.rows && results.rows.length>0){
								obj =results.rows.item( 0 ); 
								
							}
							opts.callback(obj);
						}
					);
 
				}
			);
		return obj;
	}

	SQLiteDao.prototype.list = function(tableName, opts) {
		var resultSet ;

		//$.Deferred(
		$database.transaction(
				function( transaction ){
 					var selSql = "SELECT " +
								"* " +
							"FROM " +
								tableName +
							" where 1=1 ";
							if(opts && opts.matchs){
								var filters =  opts.matchs;
								for (var k in filters)  
							      {  
							  			selSql+=" and "+k+"='"+filters[k]+"'";
							      } 
							}
//							alert(selSql);
					transaction.executeSql(
						(
							selSql
						),
						[],
						function( transaction, results ){
							//resultSet=results.rows;
							if(opts){
								opts.callback(results);
							}
							
						}
					);
					
 
				}
			);//).promise();
		return resultSet;
	}

	SQLiteDao.prototype.create = function(tableName, data) {
		var newId;
		var insSql = "INSERT INTO "+tableName+" (" ;
		var idx = 0;
		var values="";
		var valus=[];
		for (var k in data)  
	      {  
	      	if(idx>0){
	      		insSql+=",";
	      		values+=",";
	      	}
	  			insSql+=k;
	  			values+="?";
	  			valus[idx]=data[k];
	  			idx++;
	      } 
			
		insSql+=	" ) VALUES (" +
					values+
				");";
//				alert(insSql);
		$database.transaction(
			function( transaction ){
	
				transaction.executeSql(
					(
						insSql
					),
					valus
					,
					function( transaction, results ){
						// Execute the success callback,
						// passing back the newly created ID.
						//callback( results.insertId );
						newId=results.insertId;
						//data[this.getIdName(tableName)]=results.insertId;
					}
				);
		});
		return newId;
	}

	SQLiteDao.prototype.update = function(objectType, id, data) {
		var uptSql = "UPDATE "+tableName+" set " ;
		var idx = 0;
		for (var k in data)  
	      {  
	      	if(idx>0){
	      		uptSql+=",";
	      	}
	  			uptSql+=k+"='"+data[k]+"'";
	  			idx++;
	      } 
			
		uptSql+=" where "+brite.dm.getIdName(tableName)+"="+id;
		alert(uptSql);
		$database.transaction(
			function( transaction ){
				transaction.executeSql(
					(
						uptSql
					),
					[]
					,
					function( transaction, results ){
						// Execute the success callback,
						// passing back the newly created ID.
						//callback( results.insertId );
						data[brite.dm.getIdName(tableName)]=id;
					}
				);
		});
		return data;	
	}

	SQLiteDao.prototype.remove = function(tableName, filter) {
		
		$database.transaction(
				function( transaction ){
 
					var delSql = "DELETE FROM " +tableName +" where 1=1 ";
					if(filter){
						for(var k in filter){
							if(k=="callback")continue;
							delSql+=" and "+k+"='"+filter[k]+"'";
						}
					}
//					alert(delSql);
					transaction.executeSql(
						(
							delSql
						),
						[]
						,
						function(transaction, results){
							if(filter && filter.callback){
								filter.callback();
							}
						}
					);
 
				}
			);

	}
	brite.dao.SQLiteDao = SQLiteDao;

	
})(jQuery);