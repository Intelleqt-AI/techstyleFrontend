import JSZip, { file } from 'jszip';
import { saveAs } from 'file-saver';
import { error } from 'console';
import supabase from './supabaseClient';
interface SignInResponse {
  data: any;
  error: any;
}

// Get session
export const fetchSession = async () => {
  const { data, error, isLoadin } = await supabase.auth.getSession();
  if (data) {
    return { data };
  } else {
    return error;
  }
};

// Reset Password
export const resetPassword = async email => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://techstyle-frontend-7hvj.vercel.app/reset-password',
  });
};

// Update user password
export const updatePassword = async newPassword => {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
};

// Login API
export const signInWithEmail = async (email: string, password: string): Promise<SignInResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (err) {
    console.error('Unexpected error during sign-in:', err);
    return { data: null, error: err };
  }
};

// SignOut API
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error };
  } else {
    return { sucess: true };
  }
};

//Get Time Tracker
export const getTimeTracking = async () => {
  const { data, error } = await supabase.from('Time Tracker').select(`
    *,
    task:task_id (*)
  `);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Add new time tracker
export const addTimeTracker = async timer => {
  const { data, error } = await supabase.from('Time Tracker').insert(timer);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Modify timer

export const ModifyTimeTracker = async timer => {
  const { data, error } = await supabase.from('Time Tracker').update(timer).eq('id', timer.id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Get All Task
export const getTask = async () => {
  const { data, error } = await supabase.from('Task').select('*');
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// add new task
export const addNewTask = async ({ newTask, user }) => {
  if (!newTask || !user) throw new Error('No task provided');

  let tasksToInsert = Array.isArray(newTask) ? newTask : [{ ...newTask, creator: user?.email }];
  if (Array.isArray(newTask)) {
    tasksToInsert = newTask.map(t => ({ ...t, creator: user?.email }));
  }
  const { data, error } = await supabase.from('Task').insert(tasksToInsert).select();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  // Handle notifications
  data.forEach(task => {
    if (task.assigned?.length > 0) {
      const notification = {
        id: Date.now(),
        link: '/my-task',
        type: 'task',
        itemID: task.id,
        title: task.name,
        isRead: false,
        message: task.name,
        timestamp: Date.now(),
        creator: user,
      };

      task.assigned.forEach(item => {
        if (item?.email === user?.email) return;
        createNotification({ email: item.email, notification });
      });
    }
  });

  return data;
};

// Modify Task
// Modify Task
export const modifyTask = async ({ newTask, user }) => {
  const { data, error } = await supabase.from('Task').update(newTask).eq('id', newTask.id).select();
  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
  return { data };
};

// Delete Task
export const deleteTask = async taskId => {
  if (!taskId) throw new Error('Task ID is required');
  const { data, error } = await supabase.from('Task').delete().eq('id', taskId);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Delte task by projct ID
export const deleteTasksByProject = async ({ projectId }) => {
  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const { data, error } = await supabase.from('Task').delete().eq('projectID', projectId);

  if (error) {
    throw new Error(error.message);
  }

  return { data };
};

//Fetch OnlyProject data
export const fetchOnlyProject = async ({ projectID }) => {
  if (projectID) {
    const { data: project, error } = await supabase.from('Project').select('*').eq('id', projectID).single();
    return project;
  } else {
    const { data: project, error } = await supabase.from('Project').select('*');
    return project;
  }
};

// Get Projects
export const fetchProjects = async () => {
  const { data: projects, error } = await supabase.from('Project').select('*');
  if (error) {
    throw new Error(error.message);
  }
  if (!projects || projects.length === 0) {
    return []; // Return an empty array if no projects exist
  }
  // Fetch Images for Each Project
  const updatedProjects = await Promise.all(
    projects.map(async project => {
      const imagePath = `${project.id}/`;
      // List images in the folder
      const { data: imageFiles, error: imageError } = await supabase.storage.from('Cover').list(imagePath);
      if (imageError) {
        console.error('Error fetching images:', imageError);
        return { ...project, images: [] }; // Return empty array if no images found
      }
      return { ...project, images: imageFiles }; // Attach raw image file objects to project
    })
  );

  return updatedProjects;
};

// add new Project
export const addNewProject = async newProject => {
  const { data, error } = await supabase.from('Project').insert(newProject).select();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Modify Project
export const modifyProject = async updateInfo => {
  const { data, error } = await supabase.from('Project').update(updateInfo).eq('id', updateInfo.id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Delete Task
export const deleteProject = async taskId => {
  if (!taskId) throw new Error('Task ID is required');
  const { data, error } = await supabase.from('Project').delete().eq('id', taskId);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Get users
export const getUsers = async () => {
  const { data, error } = await supabase.from('Users').select('*');
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Get users currency
export const getCurrency = async (email: string) => {
  const { data, error } = await supabase.from('Users').select('studioCurrency').eq('email', email).single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.studioCurrency || null;
};

// Adduser
export const addUser = async ({ user }) => {
  const { data, error } = await supabase.from('Users').insert(user);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Updaet User Data
export const updateUser = async userData => {
  const { data, error } = await supabase.from('Users').update(userData).eq('email', userData.email);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

export const modifyUsersPerHour = async ({ id, price }) => {
  const { data, error } = await supabase.from('Users').update({ perHour: price }).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Create folder
export const createFolder = async ({ projectId, folderName, path }) => {
  if (!projectId || !folderName) {
    throw new Error('Project ID and folder name are required');
  }

  const folderPath = path ? `${projectId}/${path}/${folderName}/.folder` : `${projectId}/${folderName}/.folder`;

  const emptyFile = new Blob([''], { type: 'text/plain' });
  const { data, error } = await supabase.storage.from('Docs').upload(folderPath, emptyFile);

  if (error) {
    console.error('Error creating folder:', error.message);
    throw new Error(error.message);
  }

  return data;
};

// Upload Project Cover
export const uploadCover = async ({ file, id, path = '' }) => {
  if (!file) {
    throw new Error('No file provided.');
  }
  const filePath = path ? `${id}/${path}/${file[0].name}` : `${id}/${file[0].name}`;

  const { data, error } = await supabase.storage.from('Cover').upload(filePath, file[0]);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteCover = async ({ id, file, path = '' }) => {
  if (!id || !file) {
    throw new Error('ID and fileName are required.');
  }

  const filePath = path ? `${id}/${path}/${file}` : `${id}/${file}`;
  const { error } = await supabase.storage.from('Cover').remove([filePath]);
  if (error) {
    throw new Error(error.message);
  }

  return { success: true, message: 'File deleted successfully!' };
};

// Update upload function to support paths

export const uploadDoc = async ({ file, id, path = '', projectID, task }) => {
  if (!file) {
    throw new Error('No file provided.');
  }

  // Sanitize filename
  const safeName = file.name
    .normalize('NFKD') // normalize Unicode
    .replace(/[^\x00-\x7F]/g, '') // remove non-ASCII
    .replace(/\s+/g, '_') // replace spaces with _
    .replace(/[^a-zA-Z0-9._-]/g, ''); // remove unsafe chars

  const filePath = path ? `${id}/${path}/${safeName}` : `${id}/${safeName}`;

  const { data, error } = await supabase.storage.from('Docs').upload(filePath, file);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  if (!error && projectID && task) {
    const { data: project, error: projectError } = await supabase.from('Project').select('*').eq('id', projectID).single();

    if (projectError) throw new Error(projectError.message);

    const updatedProject = {
      ...project,
      attachments: [
        ...(project.attachments || []),
        {
          time: new Date(),
          link: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Docs/${filePath}`,
          taskID: task?.id,
          taskName: task?.name,
        },
      ],
    };

    modifyProject(updatedProject);
  }

  return data;
};

// Get documents By Folder name
export const getAllFiles = async (id, path = '') => {
  if (!id) throw new Error('ID is required');

  const folderPath = path ? `${id}/${path}` : id;
  const { data, error } = await supabase.storage.from('Docs').list(folderPath);

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  // Filter out the ".folder" placeholder files but keep track of actual folders
  const filteredData = data.filter(item => {
    if (item.name === '.folder') return false;
    return true;
  });

  return { data: filteredData };
};

// Get all documents
export const getAllFilesDB = async () => {
  const { data, error } = await supabase.storage.from('Docs').list();

  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  const allFiles = [];
  // Loop through root-level items (files and folders)
  for (const item of data) {
    if (item.name) {
      const folderData = { ...item, data: [] }; // Create a placeholder for the folder
      // Check if this item is a folder and fetch its contents
      if (item.name) {
        const { data: folderFiles, error: folderError } = await supabase.storage.from('Docs').list(item.name);
        if (folderError) {
          console.log(folderError);
          continue; // Skip this folder if there's an error
        }
        // Add the folder's files to its 'data' field
        folderData.data = [...folderData.data, ...folderFiles];
      }
      // Add the folder or file (with its nested data if it has any) to the result
      allFiles.push(folderData);
    }
  }
  return { data: allFiles };
};

// Get folder statistics (size, file count, last modified)
export const getFolderStats = async ({ projectId, folderName, path = '' }) => {
  if (!projectId || !folderName) {
    throw new Error('Project ID and folder name are required');
  }

  const folderPath = path ? `${projectId}/${path}/${folderName}` : `${projectId}/${folderName}`;

  // List all files in the folder recursively
  let allFiles = await listFolderContentsRecursively(folderPath);

  // ⬅️ Filter out ".folder" files
  allFiles = allFiles.filter(file => !file.name?.endsWith('.folder'));

  if (allFiles.length === 0) {
    return {
      size: 0,
      lastModified: new Date().toISOString(),
      fileCount: 0,
    };
  }

  // Calculate total size & last modified
  let totalSize = 0;
  let latestModified = new Date(0); // Start with earliest possible date

  allFiles.forEach(file => {
    if (file.metadata?.size) {
      totalSize += file.metadata.size;
    }

    if (file.updated_at) {
      const fileModified = new Date(file.updated_at);
      if (fileModified > latestModified) {
        latestModified = fileModified;
      }
    }
  });

  return {
    size: totalSize,
    lastModified: latestModified.toISOString(),
    fileCount: allFiles.filter(file => file.metadata).length, // only real files
  };
};

// Helper function to recursively list all files in a folder
const listFolderContentsRecursively = async (folderPath, allFiles = []) => {
  const { data, error } = await supabase.storage.from('Docs').list(folderPath);
  if (error) {
    console.error('Error listing folder contents:', error.message);
    throw new Error(error.message);
  }

  // Add current level files to the result
  allFiles.push(...data);

  // Recursively process subfolders
  for (const item of data) {
    // Skip .folder placeholder files
    if (item.name === '.folder') continue;

    // If it's a folder (no metadata), recursively list its contents
    if (!item.metadata) {
      await listFolderContentsRecursively(`${folderPath}/${item.name}`, allFiles);
    }
  }
  return allFiles;
};

export const downloadFolderAsZip = async ({ projectId, folderPath, folderName }) => {
  if (!projectId || !folderPath) {
    throw new Error('Project ID and folder path are required');
  }

  // List all files in the folder recursively
  const allFiles = await listFolderContentsRecursively(`${projectId}/${folderPath}`);

  // Filter out folder placeholders and keep only actual files
  const filesToDownload = allFiles.filter(file => file.metadata);

  if (filesToDownload.length === 0) {
    throw new Error('Folder is empty');
  }

  // Create a new ZIP file
  const zip = new JSZip();

  // Download each file and add it to the ZIP
  const downloadPromises = filesToDownload.map(async file => {
    try {
      // Calculate the file's path within the folder for ZIP structure
      const baseFolderPath = `${projectId}/${folderPath}`;
      const filePath = file.id.replace(baseFolderPath, '').replace(/^\//, '');

      // Construct the correct Supabase storage path
      // Option 1: Use the full path including project and folder
      const storagePath = `${projectId}/${folderPath}/${file.name}`;

      // Get the file data from Supabase
      let { data, error } = await supabase.storage.from('Docs').download(storagePath);

      // Option 2: If that fails, try with just projectId/filename
      if (error || !data) {
        const altPath = `${projectId}/${file.name}`;
        ({ data, error } = await supabase.storage.from('Docs').download(altPath));
      }

      // Option 3: If that also fails, try with the full metadata path if available
      if (error || (!data && file.metadata && file.metadata.path)) {
        ({ data, error } = await supabase.storage.from('Docs').download(file.metadata.path));
      }

      if (error || !data) {
        console.error('All download attempts failed:', error);
        return false;
      }

      // Add the file to the ZIP with a readable filename instead of UUID
      // Use the file.name to ensure readable filenames in the ZIP
      zip.file(file.name, data);
      return true;
    } catch (err) {
      console.error('Error processing file:', err);
      return false;
    }
  });

  // Wait for all files to be downloaded and added to the ZIP
  const results = await Promise.all(downloadPromises);

  // Check if any files were successfully added
  const successfulFiles = results.filter(result => result === true);
  if (successfulFiles.length === 0) {
    throw new Error('Failed to download any files');
  }

  // Generate the ZIP file
  try {
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    // Save the ZIP file
    saveAs(zipBlob, `${folderName || 'download'}.zip`);
    return '#';
  } catch (err) {
    console.error('Error generating ZIP:', err);
    throw new Error('Failed to create ZIP file');
  }
};

// Delete document or folder
export const deleteFile = async ({ file, id, isFolder }) => {
  if (isFolder) {
    // If it's a folder, we need to list and delete all contents first
    const folderPath = `${id}/${file}`;

    // Get all files in the folder
    const { data: folderContents, error: listError } = await supabase.storage.from('Docs').list(folderPath);

    if (listError) {
      console.error('Error listing folder contents:', listError.message);
      throw new Error(listError.message);
    }

    // Create an array of file paths to delete
    const filesToDelete = folderContents.map(item => `${folderPath}/${item.name}`);

    // If folder has contents, delete them
    if (filesToDelete.length > 0) {
      const { data: deleteContentsData, error: deleteContentsError } = await supabase.storage.from('Docs').remove(filesToDelete);

      if (deleteContentsError) {
        console.error('Error deleting folder contents:', deleteContentsError.message);
        throw new Error(deleteContentsError.message);
      }
    }

    // Also delete the .folder placeholder file
    const { data, error } = await supabase.storage.from('Docs').remove([`${folderPath}/.folder`]);

    if (error) {
      console.error('Error deleting folder:', error.message);
      throw new Error(error.message);
    }

    return data;
  } else {
    // For regular files, use the existing method
    const filePath = `${id}/${file}`;
    console.log(filePath);
    const { data, error } = await supabase.storage.from('Docs').remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error.message);
      throw new Error(error.message);
    }

    return data;
  }
};

// Create Contact
export const addNewContact = async contact => {
  const { data, error } = await supabase.from('Contacts').insert(contact);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Get Contact
export const getContact = async () => {
  const { data, error } = await supabase.from('Contacts').select('*');
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Get Contact by ID
export const getContactbyID = async id => {
  const { data, error } = await supabase
    .from('Contacts')
    .select('*')
    .eq('id', id) // Filter by ID
    .single(); // Expect a single record
  if (error) {
    throw new Error(error.message);
  }

  return data;
};
// Delete Contact
export const deleteContact = async id => {
  if (!id) throw new Error('ID is required');
  const { data, error } = await supabase.from('Contacts').delete().eq('id', id);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Update Contact
export const updateContact = async contact => {
  const { data, error } = await supabase.from('Contacts').update(contact).eq('id', contact.id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Get Client
export const getClient = async () => {
  const { data, error } = await supabase.from('Contacts').select('*').eq('type', 'Client');
  if (error) {
    throw new Error(error.message);
  }

  return { data };
};

export const getClientByProjectId = async id => {
  if (!id) {
    throw new Error('Project ID is required');
  }

  // First, get the project to find the clientId
  const { data: projectData, error: projectError } = await supabase.from('Project').select('client').eq('id', id).single();

  if (projectError) {
    throw new Error(`Error fetching project: ${projectError.message}`);
  }

  if (!projectData.client) {
    throw new Error('No client ID found for this project');
  }

  // Then get the client info using the clientId
  const { data: clientData, error: clientError } = await supabase
    .from('Contacts')
    .select('*')
    .eq('id', projectData.client)
    .eq('type', 'Client')
    .single();

  if (clientError) {
    throw new Error(`Error fetching client: ${clientError.message}`);
  }

  return { data: clientData };
};

// Get Supplier
export const getSupplier = async () => {
  const { data, error } = await supabase.from('Contacts').select('*').eq('type', 'Supplier');
  if (error) {
    throw new Error(error.message);
  }

  return { data };
};
// Create product
export const addProduct = async product => {
  const { data, error } = await supabase.from('Products').insert(product);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

//get product count

// get Product
export const getAllProduct = async idParam => {
  // Get total count of products
  const { count } = await supabase.from('Products').select('*', { count: 'exact' });
  let query = supabase.from('Products').select('*');
  // Handle different ID scenarios
  if (idParam) {
    if (Array.isArray(idParam)) {
      // If an array of IDs is provided, fetch those products
      query = query.in('id', idParam);
    } else {
      // If a single ID is provided, fetch only that product
      query = query.eq('id', idParam);
    }
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.message);
  }

  // Ensure products is always an array
  const productsArray = products ? (Array.isArray(products) ? products : [products]) : [];

  // Fetch Images for Each Product
  const updatedProducts = await Promise.all(
    productsArray.map(async product => {
      const imagePath = `${product.id}/`; // Product images are stored in a folder named after product ID
      const { data: imageFiles, error: imageError } = await supabase.storage.from('Docs').list(imagePath);

      if (imageError || !imageFiles) {
        console.error('Error fetching images:', imageError);
        return { ...product, images: [] }; // Return empty array if no images found
      }

      const sortedImageFiles = imageFiles.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      // Generate Public URLs for all images
      const imageUrls = sortedImageFiles.map(file => supabase.storage.from('Docs').getPublicUrl(`${imagePath}${file.name}`).data.publicUrl);

      return { ...product, images: imageUrls }; // Add images array to product object
    })
  );

  // Return single object if fetching by a single ID (not an array)
  return !Array.isArray(idParam) && idParam ? updatedProducts[0] : updatedProducts;
};

export const getProduct = async (options = null) => {
  const { id = null, page = 1, pageSize = 12, productType = null, searchQuery = null } = options;

  // If an ID is provided, fetch only that specific product
  if (id) {
    let query = supabase.from('Products').select('*').eq('id', id).single();
    const { data: product, error } = await query;

    if (error) {
      console.error('Error fetching product:', error);
      throw new Error(error.message);
    }

    // Fetch images for the product
    const imagePath = `${product.id}/`;
    const { data: imageFiles, error: imageError } = await supabase.storage.from('Docs').list(imagePath);
    const sortedImageFiles = imageFiles.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (imageError) {
      console.error('Error fetching images:', imageError);
      return { ...product, images: [] };
    }

    // Generate public URLs for all images
    const imageUrls = sortedImageFiles.map(file => supabase.storage.from('Docs').getPublicUrl(`${imagePath}${file.name}`).data.publicUrl);

    return { ...product, images: imageUrls };
  }

  try {
    // Create count query
    let countQuery = supabase.from('Products').select('*', { count: 'exact', head: true });

    // Apply filters to count query
    if (productType) {
      countQuery = countQuery.eq('type', productType);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      // Use ilike for case-insensitive search
      countQuery = countQuery.ilike('name', `%${searchQuery.trim()}%`);
    }

    // Execute count query
    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting products:', countError);
      throw new Error(countError.message);
    }

    // Create data query
    let dataQuery = supabase.from('Products').select('*');

    // Apply same filters to data query
    if (productType) {
      dataQuery = dataQuery.eq('type', productType);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      // Use ilike for case-insensitive search
      dataQuery = dataQuery.ilike('name', `%${searchQuery.trim()}%`);
    }

    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Apply pagination range
    dataQuery = dataQuery.range(from, to);

    // Execute data query
    const { data: products, error } = await dataQuery;

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.message);
    }

    // Handle empty results
    if (!products || products.length === 0) {
      return {
        products: [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    }

    // Fetch images for each product
    const productsWithImages = await Promise.all(
      products.map(async product => {
        const imagePath = `${product.id}/`;
        const { data: imageFiles, error: imageError } = await supabase.storage.from('Docs').list(imagePath);
        const sortedImageFiles = imageFiles.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (imageError) {
          console.error('Error fetching images:', imageError);
          return { ...product, images: [] };
        }

        // Generate public URLs for all images
        const imageUrls = sortedImageFiles.map(
          file => supabase.storage.from('Docs').getPublicUrl(`${imagePath}${file.name}`).data.publicUrl
        );

        return { ...product, images: imageUrls };
      })
    );

    return {
      products: productsWithImages,
      totalCount: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  } catch (err) {
    console.error('Error in getProduct:', err);
    throw new Error(err.message || 'Error fetching products');
  }
};

// Update Product
export const updateProductApi = async product => {
  const { data, error } = await supabase.from('Products').update(product).eq('id', product.id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Delete Product
export const deleteProduct = async id => {
  if (!id) throw new Error('Task ID is required');
  const { data, error } = await supabase.from('Products').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  return { data };
};

// Remove Product From Projects
export const removeProduct = async ({ projectID, productID, roomID }) => {
  try {
    const { data: project, error } = await supabase.from('Project').select('type').eq('id', projectID).single();
    if (error || !project) {
      return { success: false, message: 'Project not found' };
    }

    const updatedTypes = project.type.map(typeItem => {
      if (typeItem.id === roomID) {
        return {
          ...typeItem,
          product: typeItem.product.filter(prod => prod.id !== productID),
        };
      }
      return typeItem;
    });

    const { error: updateError } = await supabase.from('Project').update({ type: updatedTypes }).eq('id', projectID);

    if (updateError) {
      return {
        success: false,
        message: 'Error removing product from room',
        error: updateError.message,
      };
    }

    return { success: true, message: 'Product removed successfully from room' };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error',
      error: error.message,
    };
  }
};

// Change product room
export const changeRoom = async data => {
  const { projectID, roomID, productID } = data;
  try {
    // Fetch the project
    const { data: project, error } = await supabase.from('Project').select('product, type').eq('id', projectID).single();
    if (error || !project) {
      return { success: false, message: 'Project not found' };
    }
    let { product, type } = project;
    // Remove productID from the products array (if exists)
    product = product?.filter(id => id !== productID) || [];

    // Remove productID from all type objects
    type = type.map(room => ({
      ...room,
      product: room.product.filter(id => id !== productID),
    }));

    // Find the target room and push the productID into its product array
    const updatedType = type.map(room => {
      if (room.id === roomID) {
        return { ...room, product: [...room.product, productID] };
      }
      return room;
    });

    // Update the project with the modified products and type array
    const { error: updateError } = await supabase.from('Project').update({ product, type: updatedType }).eq('id', projectID);

    if (updateError) {
      return {
        success: false,
        message: 'Error updating room',
        error: updateError.message,
      };
    }

    return {
      success: true,
      message: 'Product successfully transferred to new room',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error',
      error: error.message,
    };
  }
};

// Get Product By Project ID
export const getProductByProjectID = async projectID => {
  try {
    // Fetch project by ID to get the product IDs
    const { data: project, error: projectError } = await supabase
      .from('Project')
      .select('product') // Assuming it's stored as an array
      .eq('id', projectID)
      .single();

    if (projectError) throw new Error(`Error fetching project: ${projectError.message}`);
    if (!project || !project.product || project.product.length === 0) {
      throw new Error('Project not found or has no products');
    }

    // Fetch all products using the extracted product IDs
    const products = await Promise.all(project.product.map(id => getProduct(id)));

    return products.filter(product => product !== null); // Remove any failed fetches
  } catch (error) {
    console.error('Error fetching products by project ID:', error.message);
    return [];
  }
};

// For Only Product grid
export const modifyProjectForProduct = async ({ product, id }) => {
  console.log(product);
  // Fetch the current project to get the existing product array
  const { data: project, error: projectError } = await supabase
    .from('Project')
    .select('product') // Assuming 'product' is an array in the database
    .eq('id', id)
    .single();
  if (projectError) {
    throw new Error(`Error fetching project: ${projectError.message}`);
  }

  // Check if the product ID is already in the array
  if (project.product.includes(product)) {
    throw new Error('Product already exists in the project');
  }

  // Push the new product ID into the existing array
  const { error: updateError } = await supabase
    .from('Project')
    .update({
      product: [...project.product, product], // Append the new product ID
    })
    .eq('id', id);

  if (updateError) {
    throw new Error(`Error updating project: ${updateError.message}`);
  }
};

// For Project Type
export const modifyProjectForTypeProduct = async ({ finalProduct, projectID, typeID }) => {
  // Fetch the current project to get the existing type array and sendToClient status
  const { data: project, error: projectError } = await supabase.from('Project').select('type, sendToClient').eq('id', projectID).single();

  if (projectError) {
    throw new Error(`Error fetching project: ${projectError.message}`);
  }

  // Find the specific type object
  const typeToUpdate = project.type.find(type => type.id === typeID);
  if (!typeToUpdate) {
    throw new Error('Type not found in the project');
  }

  // Check if the product ID already exists in type.product array
  const productExists = typeToUpdate.product.some(prod => prod.id === finalProduct.id);
  if (productExists) {
    throw new Error('Product already exists in this room');
  }

  // Create a copy of finalProduct and modify sendToClient if needed
  const productToAdd = { ...finalProduct };

  // If project.sendToClient is true, set the product's sendToClient to true
  if (project.sendToClient === true) {
    productToAdd.sendToClient = true;
  }

  // Update the types array by pushing the modified product object
  const updatedTypes = project.type.map(type => {
    if (type.id === typeID) {
      return {
        ...type,
        product: [...type.product, productToAdd],
      };
    }
    return type;
  });

  // Update the project with the modified type array
  const { error: updateError } = await supabase.from('Project').update({ type: updatedTypes }).eq('id', projectID);

  if (updateError) {
    throw new Error(`Error updating project: ${updateError.message}`);
  }
};

// Create New Chat
export const addNewChat = async newChat => {
  const { data, error } = await supabase.from('chat').insert(newChat);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Get chat by project ID
export const getChatByProjectId = async projectId => {
  if (!projectId) throw new Error('Project ID is required');
  const { data, error } = await supabase.from('chat').select('*').eq('projectID', projectId).order('created_at', { ascending: true });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

// Subscribe to new chat messages in real-time
export const subscribeToChat = (projectId, callback) => {
  if (!projectId) throw new Error('Project ID is required');

  const subscription = supabase
    .channel(`chat-${projectId}`) // Unique channel for each project
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat',
        filter: `projectID=eq.${projectId}`,
      },
      payload => {
        callback(payload.new); // Call the callback function with new message
      }
    )
    .subscribe();

  return subscription;
};

// Unsubscribe from chat updates
export const unsubscribeFromChat = subscription => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

// Modify chat by chat id
export const modifyChat = async chat => {
  const { data, error } = await supabase.from('chat').update(chat).eq('id', chat.id);
  if (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
  return { data };
};

// Send Product to client
export async function sendProductToClient({ projectID, products }) {
  try {
    // Step 1: Find the project with the matching ID
    const { data: project, error: fetchError } = await supabase.from('Project').select('*').eq('id', projectID).single();

    if (fetchError) {
      throw new Error(`Failed to fetch project: ${fetchError.message}`);
    }

    if (!project) {
      return {
        success: false,
        error: `No project found with ID: ${projectID}`,
      };
    }

    // Step 2: Create a copy of the project's type array to modify
    const updatedTypes = [...project.type];
    let updatedCount = 0;

    // Step 3: Iterate through each type object
    updatedTypes.forEach(typeObj => {
      // Check if this type has a products array
      if (Array.isArray(typeObj.product)) {
        // Step 4: For each product in the type's products array
        typeObj.product.forEach(productObj => {
          // Step 5: Check if this product's ID matches any in the provided products array
          const matchingProduct = products.find(p => p.id === productObj.id);

          if (matchingProduct) {
            // Step 6: Update sendToClient to 'true' for matched products
            productObj.sendToClient = true;
            updatedCount++;
          }
        });
      }
    });

    // Step 7: Update the project in the database with modified types
    const { data: updateData, error: updateError } = await supabase.from('Project').update({ type: updatedTypes }).eq('id', projectID);

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    return {
      success: true,
      message: `Successfully updated ${updatedCount} products`,
      projectID,
      updatedCount,
    };
  } catch (error) {
    console.error('Error updating project products:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// add Link
export const addLink = async ({ id, link, create_time, name, path }) => {
  if (!id || !link || !create_time) {
    throw new Error('ID, link, and create_time are required.');
  }
  const { data: project, error: fetchError } = await supabase.from('Project').select('links').eq('id', id).single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }
  const updatedLinks = project?.links ? [...project.links, { link, create_time, name, path }] : [{ link, create_time, name, path }];
  const { data, error: updateError } = await supabase.from('Project').update({ links: updatedLinks }).eq('id', id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { data };
};

// Get Links
export const getLinks = async id => {
  if (!id) {
    throw new Error('Project ID is required.');
  }
  const { data: project, error } = await supabase.from('Project').select('links').eq('id', id).single();
  if (error) {
    throw new Error(error.message);
  }

  return project?.links || [];
};

// Delete Link
export const deleteLink = async ({ id, create_time }) => {
  if (!id || !create_time) {
    throw new Error('Project ID and link creation time are required.');
  }

  const { data: project, error: fetchError } = await supabase.from('Project').select('links').eq('id', id).single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const updatedLinks = project?.links?.filter(link => link.create_time !== create_time) || [];
  const { data, error: updateError } = await supabase.from('Project').update({ links: updatedLinks }).eq('id', id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return data;
};

// API for notification
export const fetchNotifications = async email => {
  const { data, error } = await supabase.from('Users').select('notification').eq('email', email).single();
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data?.notification || [];
};

// Get Notification realtime
export const subscribeToNotifications = (email, callback) => {
  if (!email) throw new Error('Email is required');

  const subscription = supabase
    .channel(`user-notifications-${email}`) // Unique channel per user email
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'Users',
        filter: `email=eq.${email}`,
      },
      payload => {
        callback(payload.new.notification); // Pass new notification data to callback
      }
    )
    .subscribe();

  return subscription;
};

// Notification read api
export const markNotificationAsRead = async ({ email, notificationId }) => {
  // Fetch current notifications
  const { data, error } = await supabase.from('Users').select('notification').eq('email', email).single();
  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Failed to fetch notifications' };
  }

  const updatedNotifications = data.notification.map(notif => (notif.id === notificationId ? { ...notif, isRead: true } : notif));

  const { error: updateError } = await supabase.from('Users').update({ notification: updatedNotifications }).eq('email', email);

  if (updateError) {
    console.error('Error updating notifications:', updateError);
    return { success: false, message: 'Failed to update notification' };
  }

  return { success: true, message: 'Notification marked as read' };
};

export const markAllNotificationsAsRead = async ({ email }) => {
  // Fetch current notifications
  const { data, error } = await supabase.from('Users').select('notification').eq('email', email).single();

  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Failed to fetch notifications' };
  }

  // Mark all notifications as read
  const updatedNotifications = data.notification.map(notif => ({
    ...notif,
    isRead: true,
  }));

  // Update the database
  const { error: updateError } = await supabase.from('Users').update({ notification: updatedNotifications }).eq('email', email);

  if (updateError) {
    console.error('Error updating notifications:', updateError);
    return {
      success: false,
      message: 'Failed to mark all notifications as read',
    };
  }

  return {
    success: true,
    message: 'All notifications marked as read',
    count: updatedNotifications.length,
  };
};

// Delete
export const deleteNotification = async ({ email, notificationId }) => {
  // Fetch current notifications
  const { data, error } = await supabase.from('Users').select('notification').eq('email', email).single();
  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Failed to fetch notifications' };
  }

  const updatedNotifications = data.notification.filter(notif => notif.id !== notificationId);

  const { error: updateError } = await supabase.from('Users').update({ notification: updatedNotifications }).eq('email', email);

  if (updateError) {
    console.error('Error updating notifications:', updateError);
    return { success: false, message: 'Failed to delete notification' };
  }

  return { success: true, message: 'Notification deleted successfully' };
};

// create notification
export const createNotification = async ({ email, notification }) => {
  // Fetch current notifications
  const { data, error } = await supabase.from('Users').select('notification').eq('email', email).single();
  if (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, message: 'Failed to fetch notifications' };
  }

  // Add new notification to the existing array
  const updatedNotifications = [...data.notification, notification];

  // Update the database
  const { error: updateError } = await supabase.from('Users').update({ notification: updatedNotifications }).eq('email', email);

  if (updateError) {
    console.error('Error updating notifications:', updateError);
    return { success: false, message: 'Failed to create notification' };
  }

  return { success: true, message: 'Notification created successfully' };
};

// Create Purchase Order
export const createPurchaseOrder = async ({ order }) => {
  const { data, error } = await supabase.from('PurchaseOrder').insert(order).select();
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Create Invoice
export const createInvoice = async ({ invoice }) => {
  const { data, error } = await supabase.from('Invoices').insert(invoice);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Delete Purchase Order
export const deletePurchaseOrder = async ({ orderID }) => {
  if (!orderID) throw new Error('PO ID reuired');
  const { data, error } = await supabase.from('PurchaseOrder').delete().eq('id', orderID);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Delete Invoices
export const deleteInvoices = async ({ id }) => {
  if (!id) throw new Error('Invoice ID reuired');
  const { data, error } = await supabase.from('Invoices').delete().eq('id', id);
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Get Purchase order
export const getPurchaseOrder = async () => {
  const { data, error } = await supabase.from('PurchaseOrder').select('*').order('created_at', { ascending: false });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { data };
};

// Get Invoice
export const getInvoices = async () => {
  const { data, error } = await supabase.from('Invoices').select('*').order('created_at', { ascending: false });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return { data };
};

export const getTotalPoCount = async () => {
  const { count, error } = await supabase.from('PurchaseOrder').select('*', { count: 'exact', head: true });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  return { count };
};

// Update Purchase order
export const updatePurchaseOrder = async ({ order }) => {
  const { data, error } = await supabase.from('PurchaseOrder').update(order).match({ id: order.id });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return { data };
};

// Update Invoice
export const updateInvoice = async ({ invoice }) => {
  const { data, error } = await supabase.from('Invoices').update(invoice).match({ id: invoice.id });
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }

  return { data };
};

const processDirectory = async (bucketName: string, currentPath: string, targetPath: string) => {
  const results = [];

  // List all items in the current directory
  const { data: items, error: listError } = await supabase.storage.from(bucketName).list(currentPath, {
    sortBy: { column: 'name', order: 'asc' },
  });

  if (listError) {
    return { error: listError, results: [] };
  }

  if (!items || items.length === 0) {
    return { results: [] };
  }

  // Process all items
  for (const item of items) {
    const currentItemPath = `${currentPath}/${item.name}`;
    const targetItemPath = `${targetPath}/${item.name}`;

    if (item.metadata && item.metadata.mimetype) {
      // This is a file, copy it
      const { data: copyData, error: copyError } = await supabase.storage.from(bucketName).copy(currentItemPath, targetItemPath);

      if (copyError) {
        results.push({
          path: currentItemPath,
          success: false,
          operation: 'copy',
          error: copyError,
        });
      } else {
        results.push({
          path: currentItemPath,
          success: true,
          operation: 'copy',
        });
      }
    } else {
      // This is a directory, process it recursively
      const { results: subResults, error: subError } = await processDirectory(bucketName, currentItemPath, targetItemPath);

      results.push(...subResults);

      if (subError) {
        results.push({
          path: currentItemPath,
          success: false,
          operation: 'process_directory',
          error: subError,
        });
      }
    }
  }

  return { results };
};

const removeDirectory = async (bucketName: string, path: string) => {
  const results = [];

  // List all items in the directory
  const { data: items, error: listError } = await supabase.storage.from(bucketName).list(path, {
    sortBy: { column: 'name', order: 'asc' },
  });

  if (listError) {
    return { error: listError, results: [] };
  }

  if (!items || items.length === 0) {
    return { results: [] };
  }

  // Process all items
  for (const item of items) {
    const itemPath = `${path}/${item.name}`;

    if (item.metadata && item.metadata.mimetype) {
      // This is a file, remove it
      const { data: removeData, error: removeError } = await supabase.storage.from(bucketName).remove([itemPath]);

      if (removeError) {
        results.push({
          path: itemPath,
          success: false,
          operation: 'remove',
          error: removeError,
        });
      } else {
        results.push({
          path: itemPath,
          success: true,
          operation: 'remove',
        });
      }
    } else {
      // This is a directory, remove it recursively
      const { results: subResults, error: subError } = await removeDirectory(bucketName, itemPath);

      results.push(...subResults);

      if (subError) {
        results.push({
          path: itemPath,
          success: false,
          operation: 'remove_directory',
          error: subError,
        });
      }
    }
  }

  return { results };
};

export const renameFile = async ({ projectId, currentPath, currentFileName, newFileName }) => {
  try {
    // Validate required parameters
    if (!projectId || !currentFileName || !newFileName) {
      return { error: 'Missing required parameters' };
    }

    const bucketName = 'Docs';

    // Normalize current path to ensure it has proper slashes
    let normalizedCurrentPath = currentPath || '';
    if (normalizedCurrentPath && !normalizedCurrentPath.endsWith('/')) {
      normalizedCurrentPath += '/';
    }
    if (normalizedCurrentPath && normalizedCurrentPath.startsWith('/')) {
      normalizedCurrentPath = normalizedCurrentPath.substring(1);
    }

    // Construct full paths including projectId as the main folder
    const basePath = `${projectId}/${normalizedCurrentPath}`;
    const sourcePath = `${basePath}${currentFileName}`;
    const destinationPath = `${basePath}${newFileName}`;

    // Check if source file exists
    const { data: checkData, error: checkError } = await supabase.storage.from(bucketName).list(basePath, {
      search: currentFileName,
    });

    if (checkError) {
      return { error: checkError };
    }

    const sourceFile = checkData?.find(file => file.name === currentFileName);
    if (!sourceFile) {
      return { error: 'Source file not found' };
    }

    // Copy the file to the new name
    const { data: copyData, error: copyError } = await supabase.storage.from(bucketName).copy(sourcePath, destinationPath);

    if (copyError) {
      return { error: copyError };
    }

    // Delete the original file
    const { error: deleteError } = await supabase.storage.from(bucketName).remove([sourcePath]);

    if (deleteError) {
      return { error: deleteError };
    }

    return { success: true, data: copyData };
  } catch (error) {
    console.error('Error renaming file:', error);
    return { error: error.message || 'Failed to rename file' };
  }
};

export const renameFolder = async ({ projectId, currentPath, currentFolderName, newFolderName }) => {
  try {
    // Validate required parameters
    if (!projectId || !currentFolderName || !newFolderName) {
      return { error: 'Missing required parameters' };
    }

    // Construct paths with projectId as the main folder
    const bucketName = 'Docs';

    // Normalize current path to ensure it has proper slashes
    let normalizedCurrentPath = currentPath || '';
    if (normalizedCurrentPath && !normalizedCurrentPath.endsWith('/')) {
      normalizedCurrentPath += '/';
    }
    if (normalizedCurrentPath && normalizedCurrentPath.startsWith('/')) {
      normalizedCurrentPath = normalizedCurrentPath.substring(1);
    }

    // Construct full paths including projectId as the main folder
    const basePath = `${projectId}/${normalizedCurrentPath}`;
    const sourcePath = `${basePath}${currentFolderName}`;
    const destinationPath = `${basePath}${newFolderName}`;

    // Check if source folder exists
    const { data: checkData, error: checkError } = await supabase.storage.from(bucketName).list(sourcePath);

    if (checkError) {
      return { error: checkError };
    }

    if (!checkData || checkData.length === 0) {
      return { error: 'Source folder not found or empty' };
    }

    // Step 1: Copy all files and directories recursively
    const { results: copyResults, error: copyError } = await processDirectory(bucketName, sourcePath, destinationPath);

    if (copyError) {
      return { error: copyError };
    }

    // Step 2: Remove the original directory recursively
    const { results: removeResults, error: removeError } = await removeDirectory(bucketName, sourcePath);

    if (removeError) {
      return {
        error: {
          message: 'Error removing original directory after copy',
          details: removeError,
        },
      };
    }

    // Combine all results
    const allResults = [...copyResults, ...removeResults];

    // Check if any operations failed
    const anyFailed = allResults.some(result => result.success === false);

    if (!anyFailed) {
      return {
        data: {
          success: true,
          message: 'Folder renamed successfully',
          projectId,
          oldPath: sourcePath,
          newPath: destinationPath,
          details: allResults,
        },
      };
    } else {
      return {
        error: {
          message: 'Some operations failed during folder rename',
          details: allResults.filter(r => r.success === false),
        },
      };
    }
  } catch (error) {
    return { error };
  }
};

// Send DOC to Client
export const updateProjectClientDocs = async ({ projectID, newDocs }) => {
  const { data: projectData, error: fetchError } = await supabase.from('Project').select('clientDoc').eq('id', projectID).single();

  if (fetchError) {
    console.error('Error fetching project:', fetchError);
    throw new Error(fetchError.message);
  }

  // Combine existing clientDocs with new docs
  const updatedClientDocs = [...(projectData.clientDoc || []), ...newDocs];

  // Update the project with the merged documents
  const { data, error } = await supabase.from('Project').update({ clientDoc: updatedClientDocs }).eq('id', projectID).select();

  if (error) {
    console.error('Error updating project client documents:', error);
    throw new Error(error.message);
  }

  return { data };
};

// Update product for procurement
export const updateProductProcurement = async ({ product, projectID, roomID }) => {
  try {
    // Step 1: Find the project by projectID
    const { data: project, error } = await supabase.from('Project').select('*').eq('id', projectID).single();

    if (error) throw error;
    if (!project) throw new Error('Project not found');

    // Step 2: Find the room with roomID in the rooms array
    const roomIndex = project.type.findIndex(room => room.id === roomID);
    if (roomIndex === -1) throw new Error('Room not found in project');

    // Step 3: Find the product with matching id in the room's products array
    const productIndex = project.type[roomIndex].product.findIndex(p => p.id === product.id);
    if (productIndex === -1) throw new Error('Product not found in room');

    // Step 4: Update the product object
    project.type[roomIndex].product[productIndex] = product;

    // Step 5: Update the project in the database
    const { data: updatedProject, error: updateError } = await supabase
      .from('Project')
      .update({ type: project.type })
      .eq('id', projectID)
      .select();

    if (updateError) throw updateError;

    return updatedProject;
  } catch (error) {
    console.error('Error updating product procurement:', error);
    throw error;
  }
};

export const updateProductStatusToInternalReview = async ({ product, projectID }) => {
  try {
    // Step 1: Find the project by projectID
    const { data: project, error } = await supabase.from('Project').select('*').eq('id', projectID).single();
    if (error) throw error;
    if (!project) throw new Error('Project not found');

    // Step 2: Create a map of product IDs for efficient lookup
    const productIdMap = new Set(product.map(p => p.id));
    let productsFound = 0;

    // Step 3: Search through all rooms for matching products
    const updatedRooms = project.type.map(room => {
      // Check if this room has products
      if (room.product && Array.isArray(room.product)) {
        // Map through products in the room
        const updatedProducts = room.product.map(existingProduct => {
          // Check if this product's ID is in our product array
          if (productIdMap.has(existingProduct.id)) {
            productsFound++;
            // Return updated product with initialStatus set to "Internal Review"
            return {
              ...existingProduct,
              initialStatus: 'Internal Review',
            };
          }
          // Return product unchanged if no match
          return existingProduct;
        });

        // Return updated room with modified products
        return {
          ...room,
          product: updatedProducts,
        };
      }
      // Return room unchanged if it doesn't have products
      return room;
    });

    // Step 4: Check if products were found
    if (productsFound === 0) {
      throw new Error(`None of the products were found in any room of the project`);
    }

    // Step 5: Update the project in the database
    const { data: updatedProject, error: updateError } = await supabase
      .from('Project')
      .update({ type: updatedRooms })
      .eq('id', projectID)
      .select();

    if (updateError) throw updateError;

    return {
      updatedProject,
      productsUpdated: productsFound,
    };
  } catch (error) {
    console.error('Error updating product status to Internal Review:', error);
    throw error;
  }
};

// Send To Client Toggle Button

export const toggleSendToClient = async ({ id, state }) => {
  const { data, error } = await supabase.from('Project').update({ sendToClient: state }).eq('id', id).select();
  if (error) {
    throw new Error(error.message);
  }

  return { data };
};

export const updateAllProductsSendToClient = async ({ projectID }) => {
  try {
    // Fetch the current project to get the existing type array
    const { data: project, error: projectError } = await supabase.from('Project').select('type').eq('id', projectID).single();

    if (projectError) {
      throw new Error(`Error fetching project: ${projectError.message}`);
    }

    if (!project || !project.type || !Array.isArray(project.type)) {
      throw new Error('Project not found or has invalid type structure');
    }

    // Update all products in all types to have sendToClient = true
    const updatedTypes = project.type.map(type => {
      if (!type.product || !Array.isArray(type.product)) {
        return type; // Skip if product array doesn't exist
      }

      return {
        ...type,
        product: type.product.map(product => ({
          ...product,
          sendToClient: true,
        })),
      };
    });

    // Update the project with the modified type array
    const { error: updateError } = await supabase
      .from('Project')
      .update({
        type: updatedTypes,
        sendToClient: true, // Also update project level sendToClient
      })
      .eq('id', projectID);

    if (updateError) {
      throw new Error(`Error updating project: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'All products updated successfully',
      updatedProductsCount: updatedTypes.reduce((total, type) => total + (type.product ? type.product.length : 0), 0),
    };
  } catch (error) {
    throw new Error(`Failed to update products: ${error.message}`);
  }
};

// Xero Get Invoice
export const fetchInvoices = async () => {
  const accessToken = localStorage.getItem('xero_access_token');
  const tenantId = localStorage.getItem('xero_tenant_id');

  if (!accessToken || !tenantId) {
    throw new Error('Missing Xero token or tenant ID');
  }

  const res = await fetch('https://xero-backend-pi.vercel.app/api/get-invoices', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Invoice fetch error:', data?.error || data);
    throw new Error(data?.error || 'Failed to fetch invoices');
  }

  return data.invoices || [];
};

// Create Xero Invoice

// Get Xero Contacts
export const fetchContacts = async () => {
  const accessToken = localStorage.getItem('xero_access_token');
  const tenantId = localStorage.getItem('xero_tenant_id');

  if (!accessToken || !tenantId) {
    console.error('Missing access token or tenant ID');
    return [];
  }

  const res = await fetch('https://xero-backend-pi.vercel.app/api/get-contacts', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
    },
  });

  const data = await res.json();

  if (data.contacts) {
    return data.contacts;
  } else {
    console.error('Failed to load contacts:', data.error);
    return [];
  }
};

// API endpoint to add email to project
export const addProjectEmail = async ({ projectID, emailData }) => {
  try {
    // Validate required parameters
    if (!projectID) {
      throw new Error('Project ID is required');
    }
    if (!emailData) {
      throw new Error('Email data is required');
    }

    // First, fetch the current project to get existing emails
    const { data: currentProject, error: fetchError } = await supabase.from('Project').select('emails').eq('id', projectID).single();

    if (fetchError) {
      throw new Error(`Failed to fetch project: ${fetchError.message}`);
    }

    if (!currentProject) {
      throw new Error('Project not found');
    }

    // Get existing emails array or initialize as empty array
    const existingEmails = currentProject.emails || [];
    // Add the new email data to the existing emails array
    const updatedEmails = [...existingEmails, emailData];

    // Update the project with the new emails array
    const { data: updatedProject, error: updateError } = await supabase
      .from('Project')
      .update({ emails: updatedEmails })
      .eq('id', projectID)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update project: ${updateError.message}`);
    }

    return {
      success: true,
      project: updatedProject,
      message: 'Email added to project successfully',
    };
  } catch (error) {
    console.error('Error adding email to project:', error);
    return {
      success: false,
      error: error.message,
      project: null,
    };
  }
};

// API endpoint to fetch emails from a project
export const fetchProjectEmails = async ({ projectID }) => {
  try {
    // Validate required parameters
    if (!projectID) {
      throw new Error('Project ID is required');
    }

    // Fetch the project with only the emails field
    const { data: project, error } = await supabase.from('Project').select('emails').eq('id', projectID).single();

    if (error) {
      throw new Error(`Failed to fetch project emails: ${error.message}`);
    }

    if (!project) {
      throw new Error('Project not found');
    }

    // Return the emails array (or empty array if no emails)
    const emails = project.emails || [];

    return {
      success: true,
      emails: emails,
      count: emails.length,
      message: 'Emails fetched successfully',
    };
  } catch (error) {
    console.error('Error fetching project emails:', error);
    return {
      success: false,
      error: error.message,
      emails: [],
      count: 0,
    };
  }
};

export const createXeroInvoice = async (invoiceData: any) => {
  const accessToken = localStorage.getItem('xero_access_token');
  const tenantId = localStorage.getItem('xero_tenant_id');

  console.log(accessToken, tenantId);

  if (!accessToken || !tenantId) {
    throw new Error('Missing Xero token or tenant ID');
  }

  const res = await fetch('https://xero-backend-pi.vercel.app/api/create-invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
    },
    body: JSON.stringify(invoiceData),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Invoice creation error:', data?.error || data);
    throw new Error(data?.error || 'Failed to create invoice');
  }

  return data.invoice || null;
};
