import React, { useState } from 'react';
import { useUpdateMyProfile, useGetMyProfile } from '@workspace/api-client-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [_, setLocation] = useLocation();
  const updateMutation = useUpdateMyProfile();
  
  const [formData, setFormData] = useState({
    vehicleType: '',
    adventureLevel: '',
    travelStyle: '',
    bio: ''
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        setLocation('/home');
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2">Build Your Profile</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        <div className="glass-card p-6 min-h-[300px] flex flex-col">
          {step === 1 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h2 className="text-xl font-bold">What do you ride?</h2>
              <div className="grid grid-cols-2 gap-4">
                {['Motorcycle', 'Car', '4x4'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData({...formData, vehicleType: type.toLowerCase()})}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      formData.vehicleType === type.toLowerCase() ? 'border-primary bg-primary/20 text-primary' : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h2 className="text-xl font-bold">What's your adventure level?</h2>
              <div className="space-y-3">
                {[
                  { id: 'beginner', label: 'Weekend Warrior', desc: 'Paved roads, short trips, hotels' },
                  { id: 'intermediate', label: 'Explorer', desc: 'Mixed terrain, camping, week-long trips' },
                  { id: 'advanced', label: 'Overlander', desc: 'Off-grid, remote areas, no limits' }
                ].map(level => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({...formData, adventureLevel: level.id})}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      formData.adventureLevel === level.id ? 'border-primary bg-primary/20' : 'border-white/10 bg-black/20 hover:border-white/30'
                    }`}
                  >
                    <div className={`font-bold ${formData.adventureLevel === level.id ? 'text-primary' : ''}`}>{level.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 space-y-6 animate-in slide-in-from-right-8 duration-300">
              <h2 className="text-xl font-bold">Tell us about yourself</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Short Bio</Label>
                  <Input 
                    placeholder="E.g., Seeking muddy trails and good coffee." 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="bg-black/50"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-4">
            {step > 1 && (
              <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>Back</Button>
            )}
            <Button className="flex-1" onClick={handleNext} disabled={
              (step === 1 && !formData.vehicleType) || 
              (step === 2 && !formData.adventureLevel) || 
              updateMutation.isPending
            }>
              {step === 3 ? (updateMutation.isPending ? 'Saving...' : 'Finish') : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
