# BESD023

- **Student ID:** b671103023
- **Name:** Htut Kaung San
- **Subject:** Back-end

## Run the Project

```bash
docker compose up --build -d
docker compose ps
```

## Postman Testing

### 1. Display All Courses

**Method:** `GET`  
**Route:** `http://localhost:3000/course/list`

![GET course list tested with Postman](docs/images/course-list.png)

### 2. Search for a Course by ID

**Method:** `GET`  
**Route:** `http://localhost:3000/course/search/id?courseId=1`

![GET course by ID tested with Postman](docs/images/course-search-by-id.png)

### 3. Display Promoted Courses

**Method:** `GET`  
**Route:** `http://localhost:3000/course/promote`

![GET promoted courses tested with Postman](docs/images/course-promote.png)

### 4. Create a Course

**Method:** `POST`  
**Route:** `http://localhost:3000/course/create`

![POST create course tested with Postman](docs/images/course-create.png)

### 5. Update a Course

**Method:** `PUT`  
**Route:** `http://localhost:3000/course/update`

![PUT update course tested with Postman](docs/images/course-update.png)

### 6. Delete a Course

**Method:** `DELETE`  
**Route:** `http://localhost:3000/course/delete?courseId=7`

![DELETE course tested with Postman](docs/images/course-delete.png)
