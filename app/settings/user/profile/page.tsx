'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, UploadCloud } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { SettingsPageHeader } from '@/components/settings/page-header';
import { SettingsSection } from '@/components/settings/section';
import useUser from '@/hooks/useUser';
import { useEffect, useState } from 'react';
import { updateUser, uploadProfilePicture } from '@/supabase/API';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Slider } from '@/components/ui/slider';

export default function UserProfilePage() {
  const { user, isLoading } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    setCurrentUser(user);
  }, [user?.email, isLoading]);

  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users', user?.email]);
      toast.success('Profile Updated');
    },
    onError: error => {
      console.log(error);
      toast('Error! Try again');
    },
  });

  const handleUpdate = e => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // validation extracted into a helper
  const validateImageFile = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(file.type)) return { ok: false, message: 'Unsupported file type. Use PNG, JPG or WEBP.' };
    if (file.size > maxSize) return { ok: false, message: 'File too large. Maximum 5MB.' };
    return { ok: true };
  };

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area) => {
    const createImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', error => reject(error));
        img.setAttribute('crossOrigin', 'anonymous');
        img.src = url;
      });

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

    return canvas.toDataURL('image/png');
  };

  const handleSubmit = e => {
    e.preventDefault();
    (async () => {
      try {
        // If there's a profile picture (cropped data URL or original file), upload it first
        if (profilePic) {
          toast('Uploading image...', { duration: 4000 });
          let fileToUpload: File | null = null;

          if (profilePicFile) {
            fileToUpload = profilePicFile;
          } else if (profilePic.startsWith('data:')) {
            // convert dataURL to File
            const dataURLToFile = (dataurl: string, filename: string) => {
              const arr = dataurl.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              return new File([u8arr], filename, { type: mime });
            };

            fileToUpload = dataURLToFile(profilePic, `profile-${Date.now()}.png`);
          }

          if (fileToUpload) {
            const userId = user?.id || currentUser?.id || currentUser?.email || 'unknown';
            const res = await uploadProfilePicture({ file: [fileToUpload], id: userId });
            if (res && res.url) {
              setCurrentUser(prev => ({ ...(prev || {}), photoURL: res.url }));
              // update the currentUser object we'll send to updateUser
              const updated = { ...(currentUser || {}), photoURL: res.url };
              mutation.mutate(updated);
              return;
            }
          }
        }

        // fallback: no image to upload
        mutation.mutate(currentUser);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || 'Upload failed');
      }
    })();
  };

  return (
    <>
      <SettingsPageHeader title="Profile" description="Update your personal information." />

      {/* Profile Picture Upload Section (modern minimal) */}
      <div className="flex flex-col items-center mb-8">
        <div
          className="relative w-28 h-28 group"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            if (!file) return;
            const v = validateImageFile(file);
            if (!v.ok) return toast.error(v.message);
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onload = ev => {
              const url = ev.target?.result as string;
              setProfilePic(url);
              setTimeout(() => setShowCrop(true), 50);
            };
            reader.readAsDataURL(file);
          }}
        >
          <div className="absolute inset-0 rounded-full p-0.5 bg-gradient-to-tr from-indigo-400 via-sky-400 to-emerald-400 shadow-md"></div>
          <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center border">
            {profilePic ? (
              <img src={profilePic} alt="Profile preview" className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                {user?.photoURL ? (
                  <img src={user?.photoURL} alt="Profile preview" className="object-cover w-full h-full" />
                ) : (
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            )}

            <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
              <label className=" inline-flex items-center gap-2 bg-black/80 backdrop-blur-sm text-[10px] text-white px-9 py-1.5 cursor-pointer shadow">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const v = validateImageFile(file);
                    if (!v.ok) return toast.error(v.message);

                    setProfilePicFile(file);
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const url = ev.target?.result as string;
                      setProfilePic(url);
                      setTimeout(() => setShowCrop(true), 50);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                Change
              </label>
            </div>
          </div>

          {profilePic && (
            <button
              type="button"
              onClick={() => {
                setProfilePic(null);
                setProfilePicFile(null);
              }}
              aria-label="Remove profile picture"
              className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>

        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-900">Profile photo</div>
          <div className="text-xs text-gray-500">PNG, JPG up to 5MB · Recommended 400×400px</div>
        </div>
      </div>

      {/* Crop Modal (react-easy-crop) */}
      {showCrop && profilePic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-4 w-[min(90%,720px)]">
            <h3 className="font-semibold mb-2">Crop profile photo</h3>
            <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden relative">
              <Cropper
                image={profilePic}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={c => setCrop(c)}
                onZoomChange={z => setZoom(z)}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              {/* <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="flex-1"
              /> */}
              <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={val => setZoom(val[0])} className="flex-1" />
              <Button variant="ghost" size="sm" onClick={() => setShowCrop(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!croppedAreaPixels) return;

                  try {
                    const dataUrl = await getCroppedImg(profilePic, croppedAreaPixels);
                    setProfilePic(dataUrl);

                    const dataURLToFile = (dataurl: string, filename: string) => {
                      const arr = dataurl.split(',');
                      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
                      const bstr = atob(arr[1]);
                      let n = bstr.length;
                      const u8arr = new Uint8Array(n);
                      while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                      }
                      return new File([u8arr], filename, { type: mime });
                    };

                    const fileToUpload = dataURLToFile(dataUrl, `profile-${Date.now()}.png`);
                    const userId = user?.id || currentUser?.id || currentUser?.email || 'unknown';

                    await toast.promise(uploadProfilePicture({ file: [fileToUpload], id: userId }), {
                      loading: 'Uploading photo...',
                      success: res => {
                        if (res && res.url) {
                          setCurrentUser(prev => ({ ...(prev || {}), photoURL: res.url }));
                          const updated = { ...(currentUser || {}), photoURL: res.url };
                          mutation.mutate(updated);
                          setShowCrop(false);
                          return 'Profile picture updated!';
                        }
                        return 'Upload complete';
                      },
                      error: 'Could not upload the image',
                    });
                  } catch (err: any) {
                    console.error(err);
                    toast.error(err?.message || 'Could not crop or upload the image');
                  }
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      <SettingsSection title="Basic information" description="This will be visible to your team.">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={e => handleSubmit(e)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              value={currentUser?.name}
              onChange={value => {
                const e = {
                  target: {
                    name: 'name',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              id="name"
              placeholder="Jane Designer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              onChange={value => {
                const e = {
                  target: {
                    name: 'title',
                    value: value.target.value,
                  },
                };
                handleUpdate(e);
              }}
              value={currentUser?.title}
              id="title"
              placeholder="Senior Interior Designer"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input readOnly value={currentUser?.email} id="email" type="email" placeholder="jane@techstyles.com" />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="sm">
              Save changes
            </Button>
          </div>
        </form>
      </SettingsSection>
    </>
  );
}
