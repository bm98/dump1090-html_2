http://www.sqlitetutorial.net/sqlite-php/connect/

After that, open the command tool, navigate to the phpsqliteconnect, and type the following command:

>composer update

The following message will display:
>composer update
Loading composer repositories with package information
Updating dependencies (including require-dev)
Nothing to install or update
Generating autoload files

In addition, Composer also creates the new folder named vendor as shown in the screenshot below:

---------

After having all classes in places, you use the following command to generate the autoload file:

>composer dump-autoload -o

-----------
When you create a new instance of the PDO, it will always throw a PDOException if the connection fails.

To handle the exception you can use the try catch block as follows:
try {
   $this->pdo = new \PDO("sqlite:" . Config::PATH_TO_SQLITE_FILE);
} catch (\PDOException $e) {
   // handle the exception here
}

-----------------------

http://www.sqlitetutorial.net/sqlite-php/query/

  /**
     * Get all projects
     * @return type
     */
    public function getProjects() {
        $stmt = $this->pdo->query('SELECT project_id, project_name '
                . 'FROM projects');
        $projects = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $projects[] = [
                'project_id' => $row['project_id'],
                'project_name' => $row['project_name']
            ];
        }
        return $projects;
    }
		
------------
In case you want the fetch() method returns the row in the result set as an object you can use the \PDO::FETCH_OBJ or you can use the fetchObject() method.

The following getProjectObjectList() method returns a list of project objects.

	
     /**
     * Get the project as an object list
     * @return an array of Project objects
     */
    public function getProjectObjectList() {
        $stmt = $this->pdo->query('SELECT project_id, project_name '
                . 'FROM projects');
 
        $projects = [];
        while ($project = $stmt->fetchObject()) {
            $projects[] = $project;
        }
 
        return $projects;
    }

Note that the property names of the object correspond to the column names in the result set. For example, you can access the property names of the project object as:
	
$project->project_id;
$project->project_name;

-------------
See the following getTasks() method.

	
    /**
     * Get tasks by the project id
     * @param int $projectId
     * @return an array of tasks in a specified project
     */
    public function getTaskByProject($projectId) {
        // prepare SELECT statement
        $stmt = $this->pdo->prepare('SELECT task_id,
                                            task_name,
                                            start_date,
                                            completed_date,
                                            completed,
                                            project_id
                                       FROM tasks
                                      WHERE project_id = :project_id;');
 
        $stmt->execute([':project_id' => $projectId]);
 
        // for storing tasks
        $tasks = [];
 
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $tasks[] = [
                'task_id' => $row['task_id'],
                'task_name' => $row['task_name'],
                'start_date' => $row['start_date'],
                'completed_date' => $row['completed_date'],
                'completed' => $row['completed'],
                'project_id' => $row['project_id'],
            ];
        }
 
        return $tasks;
    }

In this method, we get all tasks associated with a project therefore we need to pass the project id to the SELECT statement.

To do so, we use the prepare() method to prepare the SELECT statement for execution and pass the project id to the statement using the execute() method.
		
