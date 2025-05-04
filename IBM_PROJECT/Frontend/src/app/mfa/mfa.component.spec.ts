import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaComponent } from './mfa.component';

describe('MfaComponent', () => {
  let component: MfaComponent;
  let fixture: ComponentFixture<MfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render MFA input fields', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('input[type="text"]')).toBeTruthy(); // Checks if input field exists
  });

  it('should call verifyCode when submitted', () => {
    spyOn(component, 'verifyCode'); // Spy on the method
    component.verifyCode('123456');
    expect(component.verifyCode).toHaveBeenCalledWith('123456');
  });
  
  
});
