import { useState } from 'react';
import EditModal from './EditModal';
import SuccessModal from './SuccessModal';
import Toast from '../assets/Shared/Toast';

const CreateProjectButton = ({ refreshMetadata }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editIndustries, setEditIndustries] = useState([]);
  const [editPath, setEditPath] = useState('');
  const [editTechStack, setEditTechStack] = useState('');
  const [editYouTubeVideoLink, setEditYouTubeVideoLink] = useState('');

  const resetForm = () => {
    setEditTitle('');
    setEditProjectDescription('');
    setEditIndustries([]);
    setEditPath('');
    setEditTechStack('');
    setEditYouTubeVideoLink('');
  };

  const handleClose = (isSuccess = false) => {
    setShowCreateModal(false);
    resetForm();
    // Show success modal only if project was created successfully
    if (isSuccess) {
      // Show toast first
      setShowToast(true);
      // Then show success modal with timeout
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);
    }
  };

  const handleCreateClick = () => {
    resetForm();
    setShowCreateModal(true);
  };

  return (
    <>
      <button
        onClick={handleCreateClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Create New Project
      </button>

      <EditModal
        show={showCreateModal}
        onClose={handleClose}
        editTitle={editTitle}
        editProjectDescription={editProjectDescription}
        editIndustries={editIndustries}
        editPath={editPath}
        editTechStack={editTechStack}
        editYouTubeVideoLink={editYouTubeVideoLink}
        setEditTitle={setEditTitle}
        setEditProjectDescription={setEditProjectDescription}
        setEditIndustries={setEditIndustries}
        setEditPath={setEditPath}
        setEditTechStack={setEditTechStack}
        setEditYouTubeVideoLink={setEditYouTubeVideoLink}
        refreshMetadata={refreshMetadata}
        isCreateMode={true}
        isSaveButtonDisabled={false}
        existingImages={[]}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
        }}
        message="Project has been created successfully!"
      />

      {showToast && (
        <Toast
          action="added"
          projectName={editTitle || 'Project'}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default CreateProjectButton;