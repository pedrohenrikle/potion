// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fmt;
use serde::{Deserialize, Serialize};
use sqlx::{migrate::MigrateDatabase, sqlite::SqliteQueryResult, Sqlite, SqlitePool};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
struct Document {
    id: i64,
    title: String,
    description: String,
}

#[derive(Debug, Serialize, Deserialize)]
enum CustomError {
    DatabaseError(String), 
    OtherError,
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            CustomError::DatabaseError(message) => write!(f, "Database Error: {}", message),
            CustomError::OtherError => write!(f, "Other Error"),
        }
    }
}

impl From<sqlx::Error> for CustomError {
    fn from(error: sqlx::Error) -> Self {
        CustomError::DatabaseError(error.to_string())
    }
}

async fn create_schema(db_url:&str) -> Result<SqliteQueryResult, sqlx::Error> {
    let pool = SqlitePool::connect(&db_url).await?;
    let qry =
    "PRAGMA foreign_keys = ON ;
    CREATE TABLE IF NOT EXISTS documents
    (
        id              INTEGER PRIMARY KEY NOT NULL,
        title           TEXT NOT NULL,
        description     TEXT NOT NULL
    );
    ";
    let result = sqlx::query(&qry).execute(&pool).await;
    pool.close().await;
    return result;
}

async fn create_database(db_url:&str) {
    if !Sqlite::database_exists(&db_url).await.unwrap_or(false){
        Sqlite::create_database(&db_url).await.unwrap();
        match create_schema(&db_url).await{
            Ok(_) => println!("Database created successfully!"),
            Err(e) => panic!("{}", e)
        }
    }
}

#[tauri::command]
async fn create_document(db_url: String) -> Result<i64, CustomError> {
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| CustomError::from(e))?;

    let id = sqlx::query(r#"INSERT INTO documents (title, description ) VALUES ('Untitled', ' ')"#)
        .execute(&pool)
        .await?
        .last_insert_rowid() as i64;

    Ok(id)
}

#[tauri::command]
async fn get_document(document_id: i64, db_url: String) -> Result<serde_json::Value, CustomError> {
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| CustomError::from(e))?;

    if let Some(document) = sqlx::query_as!(
        Document,
        "SELECT id, title, description FROM documents WHERE id = ?",
        document_id,
    ).fetch_optional(&pool).await.map_err(|e| CustomError::from(e))? {
        let json_document = serde_json::json!({
            "id": document.id,
            "title": document.title,
            "description": document.description,
        });
        Ok(json_document)
    } else {
        Err(CustomError::OtherError)
    }
}

#[tauri::command]
async fn get_documents(db_url: String) -> Result<serde_json::Value, CustomError> {
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| CustomError::from(e))?;

    let documents: Vec<Document> = sqlx::query_as!(
        Document,
        "SELECT * FROM documents"
    ).fetch_all(&pool).await.map_err(|e| CustomError::from(e))?;

    let json_documents: Vec<serde_json::Value> = documents.into_iter().map(|document| {
        serde_json::json!({
            "id": document.id,
            "title": document.title,
            "content": document.description,
        })
    }).collect();

    Ok(serde_json::Value::Array(json_documents))
}

#[tauri::command]
async fn save_document(id: i64, title: String, description: String, db_url: String) -> Result<(), CustomError> {
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| CustomError::from(e))?;

    sqlx::query(
        r#"UPDATE documents SET title = ?, description = ? WHERE id = ?"#
    )
    .bind(title)
    .bind(description)
    .bind(id)
    .execute(&pool)
    .await?;

    Ok(())
}


#[tauri::command]
async fn delete_document(document_id: i64, db_url: String) -> Result<(), CustomError> {
    let pool = SqlitePool::connect(&db_url).await.map_err(|e| CustomError::from(e))?;

    sqlx::query(r#"DELETE FROM documents WHERE id = ?"#)
        .bind(document_id)
        .execute(&pool)
        .await?;

    Ok(())
}

fn main() {
    let db_url = String::from("sqlite://../sqlite.db");

    tokio::runtime::Runtime::new().unwrap().block_on(async {
        create_database(&db_url).await;
    });

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![create_document, get_document, get_documents, save_document, delete_document])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}