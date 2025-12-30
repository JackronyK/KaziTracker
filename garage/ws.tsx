// ...existing code...

export const EditJobModal = ({
  job,
  onClose,
  onJobUpdated,
}: EditJobModalProps) => {
  const { updateJob, loading } = useJobs();

  // State - initialize with current job values
  const [formData, setFormData] = useState<EditJobFormData>({
    title: job.title,
    company: job.company,
    location: job.location || '',
    salary_range: job.salary_range || '',
    experience_required: job.experience_required || '',
    // Cast the fallback to SeniorityLevel to match the type
    seniority_level: job.seniority_level || ('Mid' as SeniorityLevel),
    tech_stack: job.tech_stack ? job.tech_stack.split(',').map(s => s.trim()).filter(s => s) : [],
    description: job.description || '',
    application_link: job.apply_url || '',
  });

  // ...existing code...

  // Handle input change
  const handleChange = (
    field: string,
    value: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ...existing code...

  {/* Seniority */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Seniority Level
    </label>
    <select
      value={formData.seniority_level}
      // Cast e.target.value to SeniorityLevel since options are controlled
      onChange={(e) => handleChange('seniority_level', e.target.value as SeniorityLevel)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option>Junior</option>
      <option>Mid</option>
      <option>Senior</option>
      <option>Lead</option>
    </select>
  </div>

  // ...existing code...
};

// ...existing code...