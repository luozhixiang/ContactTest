
(function($) {

	function SQLiteDao(tableName,identity,tableDefine) {
		
		this.init(tableName,identity,tableDefine);
	}

	SQLiteDao.prototype.init = function(tableName,identity,tableDefine) {
		_SQLiteDb.transaction(
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

	SQLiteDao.prototype.get = function(tableName, id) {
		var dfd = $.Deferred();
		_SQLiteDb.transaction(
				function( transaction ){
 
					transaction.executeSql(
						(
							"SELECT " +
								"* " +
							"FROM " +
								tableName +
							" where "+brite.dm.getIdName(tableName) +
								"="+id
						),
						[],
						function( transaction, results ){
							dfd.resolve(results.rows.item( 0 )); 
								
							
						}
					);
 
				}
			);
		return dfd.promise();
	}

	SQLiteDao.prototype.list = function(tableName, opts) {
		var resultSet ;

		var dfd = $.Deferred();
		_SQLiteDb.transaction(
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
							dfd.resolve(parseRows2Json(results.rows));
							
						}
					);
					
 
				}
			);
		return dfd.promise();
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
		var dfd = $.Deferred();
		_SQLiteDb.transaction(
			function( transaction ){
	
				transaction.executeSql(
					(
						insSql
					),
					valus
					,
					function( transaction, results ){
						dfd.resolve(results.insertId);
					}
				);
		});
		return dfd.promise();
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
//		alert(uptSql);
		var dfd = $.Deferred();
		_SQLiteDb.transaction(
			function( transaction ){
				transaction.executeSql(
					(
						uptSql
					),
					[]
					,
					function( transaction, results ){
						dfd.resolve();
					}
				);
		});
		return dfd.promise();	
	}

	SQLiteDao.prototype.remove = function(tableName, filter) {
		var dfd = $.Deferred();
		_SQLiteDb.transaction(
				function( transaction ){
 
					var delSql = "DELETE FROM " +tableName +" where 1=1 ";
					if(filter){
						for(var k in filter){
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
							dfd.resolve();
						}
					);
 
				}
			);	
			return dfd.promise();

	}
	brite.dao.SQLiteDao = SQLiteDao;

	
})(jQuery);