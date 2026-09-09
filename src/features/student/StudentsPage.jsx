import { useEffect, useState } from "react";
import { Button, Flex, Typography } from "antd";
import StudentsTable from "@/components/table/StudentsTable";
import ModalStudentAdd from "@/components/modals/ModalStudentAdd";
import { studentApi } from "@/api/endpoints/studentApi";
import { useNotification } from "@/components/NotificationProvider";

const { Title } = Typography;

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const notify = useNotification();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadStudents = async (
    page = pagination.page,
    limit = pagination.limit,
  ) => {
    try {
      setLoading(true);

      const response = await studentApi.getAll({
        page,
        limit,
      });

      setStudents(response.data);

      setPagination({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
      });
    } catch (error) {
      notify.error("Error al obtener estudiantes");
      console.error("Error al obtener estudiantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handlePageChange = (page, limit) => {
    loadStudents(page, limit);
  };

  // -----------------------------
  // NUEVO ESTUDIANTE
  // -----------------------------

  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setModalOpen(true);
  };

  // -----------------------------
  // EDITAR ESTUDIANTE
  // -----------------------------

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  // -----------------------------
  // CREAR / EDITAR
  // -----------------------------

  const handleSubmit = async (values) => {
    try {
      setSaving(true);

      if (selectedStudent) {
        await studentApi.update(selectedStudent.id_student, values);
        notify.success("Alumno actualizado");
      } else {
        await studentApi.create(values);
        notify.success("Alumno registrado");
      }

      setModalOpen(false);
      setSelectedStudent(null);

      await loadStudents(pagination.page, pagination.limit);

      return true;
    } catch (error) {
      notify.error("Fallo en el guardado");
      console.error("Error al guardar estudiante:", error);

      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="small"
        className="mb-6"
      >
        <Title level={2} className="mb-0 text-xl sm:text-2xl">
          ESTUDIANTES
        </Title>

        <Button type="primary" onClick={handleOpenCreate}>
          Nuevo estudiante
        </Button>
      </Flex>

      <StudentsTable
        dataSource={students}
        loading={loading}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        total={pagination.total}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
      />

      <ModalStudentAdd
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleSubmit}
        student={selectedStudent}
        loading={saving}
      />
    </div>
  );
}
