const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Arreglos en memoria
let employees = [];
let projects = [];

// Datos simulados
const emp1 = {
    id: uuidv4(),
    name: "Ana Torres",
    role: "Desarrolladora",
    projects: [],
};
const emp2 = {
    id: uuidv4(),
    name: "Carlos Ramírez",
    role: "QA Tester",
    projects: [],
};
const emp3 = {
    id: uuidv4(),
    name: "Laura Pérez",
    role: "Project Manager",
    projects: [],
};

const proj1 = {
    id: uuidv4(),
    name: "Proyecto A",
    startDate: "2025-06-01",
    employees: [],
};
const proj2 = {
    id: uuidv4(),
    name: "Proyecto B",
    startDate: "2025-06-02",
    employees: [],
};

// Asignaciones cruzadas
emp1.projects.push(proj1.id);
emp2.projects.push(proj1.id);
proj1.employees.push(emp1.id, emp2.id);

emp3.projects.push(proj2.id);
proj2.employees.push(emp3.id);

employees.push(emp1, emp2, emp3);
projects.push(proj1, proj2);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Accenture",
            version: "1.0.0",
            description: "API para gestionar empleados de un proyecto",
        },
    },
    apis: ["./index.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Obtener todos los empleados
 *     responses:
 *       200:
 *        description: Lista de empleados
 */
app.get("/employees", (req, res) => {
    res.json(employees);
});

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: Obtener un empleado por ID
 *     responses:
 *       200:
 *         description: Empleado encontrado
 */
app.get("/employees/:id", (req, res) => {
    const id = req.params.id;
    const employee = employees.find((p) => p.id === id);

    if (employee) {
        res.json(employee);
    } else {
        res.status(404).json({ message: "Empleado no encontrado: " + id });
    }
});

/**
 * @swagger
 * /employees/{id}:
 *     post:
 *         summary: Crear un empleado por ID
 */
app.post("/employees", (req, res) => {
    const newEmployee = req.body;

    // Verifica si es un solo empleado o un array de empleados
    const employeesToAdd = Array.isArray(newEmployee)
        ? newEmployee
        : [newEmployee];

    // Validación básica y guardado de empleados
    employeesToAdd.forEach((employee) => {
        if (!employee.name || !employee.role) {
            return res
                .status(400)
                .json({ message: "El nombre y el rol son obligatorios" });
        }

        const newEmp = {
            id: uuidv4(),
            name: employee.name,
            role: employee.role,
            projects: [],
        };
        employees.push(newEmp);

        const jsonResponse = {
            id: newEmp.id,
            message: "Empleado creados exitosamente",
            name: newEmployee.name,
            role: newEmployee.role,
        };
        res.status(201).json(jsonResponse);
    });
});

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Actualizar el rol de un empleado
 */
app.put("/employees/:id", (req, res) => {
    const id = req.params.id;
    const { role } = req.body;

    // Validación básica
    if (typeof role !== "string") {
        return res.status(400).json({ message: "El rol debe ser un string" });
    }

    const employee = employees.find((p) => p.id === id);
    const jsonResponse = {
        id: uuidv4(),
        message: "Empleado actualizado",
        name: employee.name,
        role: role,
    };

    if (employee) {
        employee.role = role;
        res.json(employee);
        res.json(jsonResponse);
    } else {
        res.status(404).json({ message: "Empleado no encontrado" });
    }
});

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Eliminar un empleado por ID
 */
app.delete("/employees/:id", (req, res) => {
    const id = req.params.id;
    employees = employees.filter((p) => p.id !== id);
    const jsonResponse = {
        id: id,
        message: "Empleado eliminado",
    };
    res.json(jsonResponse);
});

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Obtener todos los proyectos
 *     responses:
 *       200:
 *        description: Lista de proyectos
 */
app.get("/projects", (req, res) => {
    res.json(projects);
});

/**
 * @swagger
 * /projects/{id}:
 *     post:
 *         summary: Crear un proyecto por ID
 */
app.post("/projects", (req, res) => {
    const newProject = req.body;
    const projectsToAdd = Array.isArray(newProject) ? newProject : [newProject];
    projectsToAdd.forEach((project) => {
        if (!project.name || !project.startDate) {
            return res
                .status(400)
                .json({
                    message: "El nombre y la fecha de inicio son obligatorios",
                });
        }
        const newProj = {
            id: uuidv4(),
            name: project.name,
            startDate: project.startDate,
            employees: [],
        };
        projects.push(newProj);
    });
    res.status(201).json({ message: "Proyectos creados exitosamente" });
});

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Actualizar la fecha de inicio de un proyecto
 */
app.put("/projects/:id", (req, res) => {
    const id = req.params.id;
    const { startDate } = req.body;
    const project = projects.find((p) => p.id === id);
    if (project) {
        project.startDate = startDate;
        res.json(project);
    } else {
        res.status(404).json({ message: "Proyecto no encontrado" });
    }
    res.json({ message: "Proyecto actualizado" });
});

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Eliminar un proyecto por ID
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 */

app.delete("/projects/:id", (req, res) => {
    const id = req.params.id;
    projects = projects.filter((p) => p.id !== id);
    res.json({ message: "Proyecto eliminado" });
});

app.listen(port, () => {
    console.log(`API ejecutandose en el puerto ${port}`);
});
